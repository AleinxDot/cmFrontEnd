import { useState, useEffect, useRef } from 'react';
import {
    PackageSearch, Plus, Edit, Archive, RefreshCcw, Search, Camera,
    ArrowUpDown, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import { getProductsList, toggleProductArchive } from './catalogService';
import { CreateProductModal } from './CreateProductModal';
import { BarcodeScanner } from '../../components/ui/BarcodeScanner';

export const ProductListPage = () => {
    // --- ESTADOS ---
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filtros
    const [search, setSearch] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Paginación y Orden
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false); // Para ocultar botón "Cargar más"
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    // UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Referencia para evitar dobles llamadas en StrictMode
    const isFirstRender = useRef(true);

    // 1. EFECTO: Reseteo al cambiar filtros (Busqueda, Archivo, Orden)
    useEffect(() => {
        // Si no es el primer render, reseteamos la lista para buscar de nuevo
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadProducts(0, true); // Carga inicial
            return;
        }

        // Delay para no saturar mientras escribes (Debounce)
        const timer = setTimeout(() => {
            setPage(0); // Volvemos a página 0
            loadProducts(0, true); // true = Reemplazar lista (reset)
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, showArchived, sortConfig]);

    // 2. EFECTO: Cargar más páginas (Solo cuando cambia 'page' y es > 0)
    useEffect(() => {
        if (page > 0) {
            loadProducts(page, false); // false = Agregar a la lista (append)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const loadProducts = async (currentPage: number, shouldReset: boolean) => {
        setLoading(true);
        const status = showArchived ? 'ARCHIVED' : 'ACTIVE';
        const sortParam = `${sortConfig.key},${sortConfig.direction}`;

        try {
            // Tamaño fijo de 20 para cargar rápido
            const data = await getProductsList(search, status, currentPage, 20, sortParam);

            if (shouldReset) {
                setProducts(data.content || []); // Reemplazar todo
            } else {
                // Filtrar duplicados por seguridad (a veces React renderiza doble)
                setProducts(prev => {
                    const newItems = data.content || [];
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewItems = newItems.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewItems];
                });
            }

            setIsLastPage(data.last); // ¿Es la última página?
        } catch (error) {
            console.error("Error cargando productos", error);
        } finally {
            setLoading(false);
        }
    };

    // Manejar Ordenamiento
    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        // El useEffect detectará el cambio y recargará
    };

    const getSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-purple-600" />
            : <ArrowDown size={14} className="text-purple-600" />;
    };

    const handleScan = (code: string) => {
        setSearch(code);
        setIsScannerOpen(false);
    };

    const handleArchiveToggle = async (product: any) => {
        const action = showArchived ? "RESTAURAR" : "ARCHIVAR";
        if (!confirm(`¿Seguro que deseas ${action} el producto "${product.name}"?`)) return;
        try {
            await toggleProductArchive(product.id);
            // Recargamos solo la página actual para refrescar estado
            setPage(0);
            loadProducts(0, true);
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <PackageSearch className="text-purple-600" /> Catálogo
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {products.length} ítems visibles
                    </span>
                </h1>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={e => setShowArchived(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="hidden md:inline">Mostrar Archivados</span>
                        <span className="md:hidden">Archivados</span>
                    </label>

                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow"
                    >
                        <Plus size={20} /> <span className="hidden md:inline">Nuevo</span><span className="md:hidden">Crear</span>
                    </button>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="flex gap-2 mb-4 sticky top-0 z-10 bg-gray-50 pb-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre, marca..."
                        className="w-full pl-10 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">✕</button>
                    )}
                </div>
                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-700 transition shadow-sm"
                >
                    <Camera size={24} />
                </button>
            </div>

            {/* TABLA CON SCROLL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-sm uppercase">
                            <tr>
                                <th onClick={() => handleSort('barcode')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Código {getSortIcon('barcode')}</div>
                                </th>
                                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Producto {getSortIcon('name')}</div>
                                </th>
                                <th onClick={() => handleSort('brand.name')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Marca {getSortIcon('brand.name')}</div>
                                </th>
                                <th onClick={() => handleSort('category.name')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Categoría {getSortIcon('category.name')}</div>
                                </th>
                                <th onClick={() => handleSort('unitPrice')} className="p-4 text-right cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center justify-end gap-1">Precio {getSortIcon('unitPrice')}</div>
                                </th>
                                <th onClick={() => handleSort('stock')} className="p-4 text-center cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center justify-center gap-1">Stock {getSortIcon('stock')}</div>
                                </th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 && !loading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-slate-400">No se encontraron productos.</td></tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id} className={`hover:bg-slate-50 transition ${showArchived ? 'opacity-75 bg-slate-50' : ''}`}>
                                        <td className="p-4 font-mono text-xs text-slate-500">{p.barcode}</td>
                                        <td className="p-4 font-medium text-slate-800">{p.name}</td>
                                        <td className="p-4 text-slate-600 text-sm">{p.brandName}</td>
                                        <td className="p-4 text-slate-600 text-sm">{p.categoryName}</td>
                                        <td className="p-4 text-right font-bold text-blue-600">S/ {p.price.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {!showArchived && (
                                                <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-blue-600 transition"><Edit size={18} /></button>
                                            )}
                                            <button onClick={() => handleArchiveToggle(p)} className={`p-2 transition ${showArchived ? 'text-green-500' : 'text-slate-400 hover:text-red-500'}`}>
                                                {showArchived ? <RefreshCcw size={18} /> : <Archive size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* BOTÓN CARGAR MÁS */}
                {!isLastPage && (
                    <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={loading}
                            className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-full font-medium shadow-sm hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 transition flex items-center gap-2 mx-auto"
                        >
                            {loading ? 'Cargando...' : (
                                <>
                                    <Download size={16} /> Cargar más productos
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* MODALES */}
            {isModalOpen && <CreateProductModal onClose={() => setIsModalOpen(false)} onSuccess={() => { setPage(0); loadProducts(0, true); }} productToEdit={editingProduct} />}
            {isScannerOpen && <BarcodeScanner onScanSuccess={handleScan} onClose={() => setIsScannerOpen(false)} />}
        </div>
    );
};