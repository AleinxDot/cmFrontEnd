import { useEffect, useState } from 'react';
import { Plus, Save, Search, Trash2, PackagePlus, FileText, Camera, Truck } from 'lucide-react'; // 1. Importamos Camera
import { searchProducts, createStockEntry } from './inventoryService';
import type { StockEntryItem } from './types';
import { BarcodeScanner } from '../../components/ui/BarcodeScanner';
import { getSuppliers, createSupplier } from './supplierService';
import type { Supplier } from './types';
import { CreateSupplierModal } from './CreateSupplierModal';

export const InventoryPage = () => {
    // Estado del Formulario Cabecera
    const [reference, setReference] = useState('');
    const [comments, setComments] = useState('');
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

    // Estado del Buscador y Producto actual
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    // Estado del Item a agregar (Cantidad y Costo)
    const [quantity, setQuantity] = useState(1);
    const [cost, setCost] = useState(0);

    // Lista de Items agregados
    const [items, setItems] = useState<StockEntryItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Estado para el Escáner
    const [isScannerOpen, setIsScannerOpen] = useState(false); // 3. Nuevo estado
    // --- NUEVO: Estado para Proveedores ---
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');


    // Cargar proveedores al inicio
    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Error cargando proveedores", error);
        }
    };

    // Función rápida para crear proveedor (Podrías hacer un modal más complejo)
    const handleQuickCreateSupplier = () => {
        setIsSupplierModalOpen(true);
    };
    const handleSupplierCreated = (newSupplier: any) => {
        setSuppliers([...suppliers, newSupplier]); // Agregarlo a la lista
        setSelectedSupplierId(newSupplier.id);      // Seleccionarlo
        // El modal se cierra solo en el componente
    };
    // --- MANEJADORES ---

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length > 2) {
            const results = await searchProducts(val);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    // 4. Nueva función para manejar el escaneo
    const handleScan = async (code: string) => {
        setIsScannerOpen(false); // Cerrar cámara
        setSearchTerm(code);

        try {
            // Buscar inmediatamente el producto escaneado
            const results = await searchProducts(code);

            // Lógica de auto-selección
            if (results && results.length > 0) {
                // Prioridad: Coincidencia exacta de código de barras
                const exactMatch = results.find((p: any) => p.barcode === code);

                if (exactMatch) {
                    selectProduct(exactMatch); // Seleccionar automáticamente
                } else if (results.length === 1) {
                    selectProduct(results[0]); // Si solo hay uno, seleccionarlo
                } else {
                    setSearchResults(results); // Si hay varios parecidos, mostrar lista
                }
            } else {
                alert("Producto no encontrado en el catálogo");
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error buscando producto escaneado", error);
        }
    };

    const selectProduct = (prod: any) => {
        setSelectedProduct(prod);
        setCost(prod.unitPrice); // Sugerimos el precio actual como costo base
        setSearchResults([]);
        setSearchTerm('');
    };

    const addItem = () => {
        if (!selectedProduct || quantity <= 0 || cost < 0) return;

        const newItem: StockEntryItem = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: quantity,
            unitCost: cost
        };

        setItems([...items, newItem]);

        // Resetear selección
        setSelectedProduct(null);
        setQuantity(1);
        setCost(0);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (items.length === 0) return;
        setLoading(true);
        try {
            await createStockEntry({
                reference,
                comments,
                supplierId: selectedSupplierId ? Number(selectedSupplierId) : null, // <--- ENVIAR ID
                items: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                    unitCost: i.unitCost
                }))
            });
            alert("Ingreso registrado correctamente");
            setItems([]);
            setReference('');
            setComments('');
            setSelectedSupplierId(''); // Resetear proveedor
        } catch (error) {
            console.error(error);
            alert("Error al registrar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <PackagePlus className="text-blue-600" /> Ingreso de Mercadería
            </h1>

            {/* SECCIÓN 1: DATOS DEL DOCUMENTO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Selector de Proveedor */}
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Truck className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select
                                className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={selectedSupplierId}
                                onChange={e => setSelectedSupplierId(Number(e.target.value))}
                            >
                                <option value="">-- Seleccionar --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* BOTÓN + */}
                        <button
                            onClick={handleQuickCreateSupplier}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg border border-slate-300"
                            title="Crear Proveedor Rápido"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Documento Ref.</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Ej: Factura F001-4567"
                            className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios</label>
                    <input
                        type="text"
                        placeholder="Nota interna..."
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                    />
                </div>
            </div>

            {/* SECCIÓN 2: AGREGAR PRODUCTOS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Agregar Productos</h3>

                <div className="flex flex-col md:flex-row gap-4 items-end">

                    {/* Buscador con Botón de Escáner */}
                    <div className="flex-1 relative">
                        <label className="text-xs font-bold text-slate-500">Buscar Producto</label>
                        <div className="flex gap-2"> {/* Contenedor Flex para Input y Botón */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Escribe nombre o código..."
                                    className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchTerm}
                                    onChange={e => handleSearch(e.target.value)}
                                    disabled={selectedProduct !== null}
                                />
                            </div>
                            {/* Botón Escáner */}
                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Escanear código de barras"
                                disabled={selectedProduct !== null}
                            >
                                <Camera size={24} />
                            </button>
                        </div>

                        {/* Dropdown de Resultados */}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                                {searchResults.map(prod => (
                                    <div
                                        key={prod.id}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                        onClick={() => selectProduct(prod)}
                                    >
                                        <p className="font-medium text-slate-800">{prod.name}</p>
                                        <p className="text-xs text-slate-500">Cód: {prod.barcode}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inputs de Detalle (Solo aparecen si hay producto seleccionado) */}
                    {selectedProduct && (
                        <>
                            <div className="w-32">
                                <label className="text-xs font-bold text-slate-500">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                                    value={quantity}
                                    onChange={e => setQuantity(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-xs font-bold text-slate-500">Costo Unit.</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border border-slate-300 rounded-lg text-center"
                                    value={cost}
                                    onChange={e => setCost(parseFloat(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={addItem}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 h-[42px] px-4 flex items-center gap-2"
                            >
                                <Plus size={20} /> Agregar
                            </button>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-[42px]"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>

                {selectedProduct && (
                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 inline-block">
                        Seleccionado: <strong>{selectedProduct.name}</strong>
                    </div>
                )}
            </div>

            {/* SECCIÓN 3: TABLA DE RESUMEN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                        <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4 text-center">Cantidad</th>
                            <th className="p-4 text-right">Costo Unit.</th>
                            <th className="p-4 text-right">Subtotal</th>
                            <th className="p-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                    No hay items en el ingreso.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-4 font-medium text-slate-800">{item.productName}</td>
                                    <td className="p-4 text-center">{item.quantity}</td>
                                    <td className="p-4 text-right">S/ {item.unitCost.toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold">S/ {(item.quantity * item.unitCost).toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {items.length > 0 && (
                        <tfoot className="bg-slate-50 font-bold text-slate-800">
                            <tr>
                                <td colSpan={3} className="p-4 text-right">Total Ingreso:</td>
                                <td className="p-4 text-right text-lg">
                                    S/ {items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0).toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* BOTÓN FINAL */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={items.length === 0 || loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition
                        ${items.length === 0 || loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    `}
                >
                    {loading ? 'Guardando...' : (
                        <>
                            <Save size={20} /> GUARDAR INGRESO
                        </>
                    )}
                </button>
            </div>

            {/* Renderizado del Componente Escáner */}
            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
            {/* RENDERIZAR EL MODAL AL FINAL */}
            {isSupplierModalOpen && (
                <CreateSupplierModal
                    onClose={() => setIsSupplierModalOpen(false)}
                    onSuccess={handleSupplierCreated}
                />
            )}
        </div>
    );
};