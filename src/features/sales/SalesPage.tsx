import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, ShoppingCart, Plus, Minus, CreditCard, CheckCircle, User, UserPlus, X, FileText } from 'lucide-react';
import { searchProducts, createSale } from './salesService';
import { searchCustomers } from '../customers/customerService';
import { CreateCustomerModal } from '../customers/CreateCustomerModal';
import type { CartItem, Product } from './types';
import type { Customer } from '../customers/types';
import { Camera } from 'lucide-react';
import { BarcodeScanner } from '../../components/ui/BarcodeScanner';


export const SalesPage = () => {
    // Estados
    const [docType, setDocType] = useState<'BOLETA' | 'FACTURA' | 'COTIZACION'>('BOLETA');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [successId, setSuccessId] = useState<string | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    // Referencia para mantener el foco en el buscador (para escanear seguido)
    const searchInputRef = useRef<HTMLInputElement>(null);


    // Enfocar el input al cargar la página
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // --- LÓGICA DEL CARRITO ---

    const addToCart = (product: Product) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                // Si ya existe, sumamos 1
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            }
            // Si es nuevo, lo agregamos
            return [...prev, { ...product, quantity: 1, subtotal: product.price }];
        });
        // Limpiamos búsqueda y re-enfocamos para el siguiente escaneo
        setSearchTerm('');
        setSearchResults([]);
        searchInputRef.current?.focus();
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, subtotal: newQty * item.price };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // --- LÓGICA DE BÚSQUEDA ---

    const handleSearch = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchTerm.trim().length > 0) {
            // Buscamos en el backend
            try {
                const results = await searchProducts(searchTerm);

                if (results.length === 1) {
                    // SI ES EXACTO (Lectura de Barras): Agregamos directo
                    addToCart(results[0]);
                } else {
                    // SI HAY VARIOS (Búsqueda por nombre): Mostramos lista
                    setSearchResults(results);
                }
            } catch (error) {
                console.error("Error buscando", error);
            }
        }
    };

    // --- LÓGICA DE BÚSQUEDA DE CLIENTES ---

    const handleSearchCustomer = async (val: string) => {
        setCustomerQuery(val);
        if (val.length > 2) {
            const results = await searchCustomers(val);
            setCustomerResults(results);
        } else {
            setCustomerResults([]);
        }
    };
    const selectCustomer = (cust: Customer) => {
        setSelectedCustomer(cust);
        setCustomerQuery(''); // Limpiar busqueda
        setCustomerResults([]); // Ocultar lista
    };

    const clearCustomer = () => {
        setSelectedCustomer(null);
        setCustomerQuery('');
    };

    // --- LÓGICA DE VENTA ---

    const handleFinalizeSale = async () => {
        if (cart.length === 0) return;

        // Validación: Si es FACTURA, obligar a seleccionar cliente
        if (docType === 'FACTURA' && !selectedCustomer) {
            alert("Para emitir FACTURA debe seleccionar un cliente con RUC.");
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                clientId: selectedCustomer ? selectedCustomer.id : null, // <--- AQUI USAMOS EL ID
                type: docType,
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
            };

            const response = await createSale(saleData);
            setSuccessId(response.documentNumber || "Registrado");
            setCart([]);
            setSelectedCustomer(null); // Resetear cliente
        } catch (error) {
            alert("Error al procesar venta.");
        } finally {
            setLoading(false);
        }
    };

    // Función que recibe el código de la cámara
    const handleScanSuccess = (code: string) => {
        setIsScannerOpen(false); // Cerramos cámara
        setSearchTerm(code); // Ponemos el código en el input

        // Disparamos la búsqueda automáticamente (simulamos el Enter)
        // Reutilizamos tu lógica de búsqueda existente:
        searchProducts(code).then(results => {
            if (results.length === 1) {
                addToCart(results[0]);
                setSearchTerm(''); // Limpiar si se agregó directo
            } else {
                setSearchResults(results);
            }
        });
    };

    // Cálculos de Totales
    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // --- UI ---

    if (successId) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <CheckCircle size={64} className="text-green-500 mb-4" />
                <h2 className="text-3xl font-bold text-slate-800">¡Venta Exitosa!</h2>
                <p className="text-slate-500 mt-2">Documento: {successId}</p>
                <button
                    onClick={() => setSuccessId(null)}
                    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Nueva Venta
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-100px)] h-auto gap-6">

            {/* COLUMNA IZQUIERDA: BUSCADOR Y RESULTADOS */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <label className="text-xs font-bold text-slate-400 uppercase">Buscador / Lector</label>
                    <div className="relative mt-1 flex gap-2"> {/* Agregamos flex y gap */}

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Escanea código o escribe nombre..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>

                        {/* BOTÓN CÁMARA */}
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-700 transition shadow-md"
                            title="Usar Cámara"
                        >
                            <Camera size={24} />
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Presiona ENTER para buscar o usa la cámara.</p>
                </div>

                {/* Lista de Resultados de Búsqueda */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto p-4">
                    <h3 className="font-semibold text-slate-700 mb-3">Resultados Disponibles</h3>
                    {searchResults.length === 0 && <p className="text-slate-400 text-sm">No hay resultados recientes.</p>}

                    <div className="grid grid-cols-1 gap-2">
                        {searchResults.map(product => (
                            <div key={product.id}
                                onClick={() => addToCart(product)}
                                className="p-3 border border-slate-100 rounded-lg hover:bg-blue-50 cursor-pointer transition flex justify-between items-center group"
                            >
                                <div>
                                    <p className="font-medium text-slate-800">{product.name}</p>
                                    <p className="text-xs text-slate-500">Stock: {product.stock} | Cód: {product.barcode}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">S/ {product.price.toFixed(2)}</p>
                                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100">Click para agregar</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: CARRITO Y PAGO */}
            <div className="w-full md:w-[400px] bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col">
                {/* Cabecera del Ticket */}
                <div className="p-4 bg-slate-800 text-white rounded-t-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Cliente</span>
                        {!selectedCustomer && (
                            <button onClick={() => setIsCustomerModalOpen(true)} className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded flex items-center gap-1">
                                <UserPlus size={14} /> Nuevo
                            </button>
                        )}
                    </div>

                    {selectedCustomer ? (
                        <div className="flex justify-between items-center bg-slate-700 p-2 rounded border border-slate-600">
                            <div>
                                <p className="font-bold text-sm text-white">{selectedCustomer.name}</p>
                                <p className="text-xs text-slate-400">{selectedCustomer.docNumber}</p>
                            </div>
                            <button onClick={clearCustomer} className="text-red-400 hover:text-red-300">
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar Cliente (DNI/Nombre)..."
                                className="w-full pl-10 p-2 rounded text-slate-900 text-sm outline-none"
                                value={customerQuery}
                                onChange={e => handleSearchCustomer(e.target.value)}
                            />
                            {/* Lista desplegable de clientes */}
                            {customerResults.length > 0 && (
                                <div className="absolute top-10 left-0 w-full bg-white text-slate-900 rounded shadow-xl border border-slate-200 z-10 max-h-40 overflow-auto">
                                    {customerResults.map(c => (
                                        <div key={c.id} onClick={() => selectCustomer(c)} className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b">
                                            <p className="font-bold">{c.name}</p>
                                            <p className="text-xs text-slate-500">{c.docNumber}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. CABECERA TICKET (MODIFICADA: Ya no es rounded-t, ahora es cuadrada arriba) */}
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setDocType('BOLETA')}
                            className={`flex-1 py-1 text-sm font-medium rounded-md transition ${docType === 'BOLETA' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            BOLETA
                        </button>
                        <button
                            onClick={() => setDocType('FACTURA')}
                            className={`flex-1 py-1 text-sm font-medium rounded-md transition ${docType === 'FACTURA' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            FACTURA
                        </button>
                        <button
                            onClick={() => setDocType('COTIZACION')}
                            className={`flex-1 py-1 text-sm font-medium rounded-md transition ${docType === 'COTIZACION' ? 'bg-purple-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            COTIZACIÓN
                        </button>
                    </div>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <ShoppingCart size={48} className="mb-2" />
                            <p>Carrito vacío</p>
                        </div>
                    )}

                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-slate-500">Unit: S/ {item.price.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-slate-200 rounded-md">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 text-slate-500"><Minus size={14} /></button>
                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 text-slate-500"><Plus size={14} /></button>
                                </div>
                                <p className="font-bold text-slate-800 w-16 text-right">
                                    {(item.subtotal).toFixed(2)}
                                </p>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Totales y Botón */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                    <div className="flex justify-between items-center mb-2 text-slate-500">
                        <span>Subtotal</span>
                        <span>S/ {(totalAmount / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-slate-500">
                        <span>IGV (18%)</span>
                        <span>S/ {(totalAmount - (totalAmount / 1.18)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-2xl font-bold text-slate-900">
                        <span>Total</span>
                        <span>S/ {totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleFinalizeSale}
                        disabled={cart.length === 0 || loading}
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition transform active:scale-95
                            ${cart.length === 0 || loading ? 'bg-slate-400 cursor-not-allowed' :
                                docType === 'COTIZACION' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}
                        `}
                    >
                        {loading ? 'Procesando...' : (
                            <>
                                {docType === 'COTIZACION' ? <FileText size={20} /> : <CreditCard size={20} />}
                                {docType === 'COTIZACION' ? ' GUARDAR COTIZACIÓN' : ' CONFIRMAR VENTA'}
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Modal de nuevo cliente */}
            {isCustomerModalOpen && (
                <CreateCustomerModal
                    onClose={() => setIsCustomerModalOpen(false)}
                    onSuccess={(newCust) => selectCustomer(newCust)}
                />
            )}
            {/* Renderizado de escáner */}
            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
};