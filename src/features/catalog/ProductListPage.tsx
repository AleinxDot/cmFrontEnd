// src/features/catalog/ProductListPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
    PackageSearch, Plus, Edit, Archive, RefreshCcw, Search, ArrowUpDown,
    ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
    ScanLine
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

    // Paginación y Totales
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0); // Contador total
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    // UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const isFirstRender = useRef(true);

    // Reseteo al cambiar filtros
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            loadProducts(0);
            return;
        }
        const timer = setTimeout(() => {
            setPage(0);
            loadProducts(0);
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, showArchived, sortConfig, pageSize]);

    // Cambio de página
    useEffect(() => {
        if (!isFirstRender.current) {
            loadProducts(page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const loadProducts = async (currentPage: number) => {
        setLoading(true);
        // Convertimos el checkbox a booleano para 'isActive'
        // Si quiero ver archivados (showArchived=true), entonces isActive debe ser false.
        const isActive = !showArchived;

        const sortParam = `${sortConfig.key},${sortConfig.direction}`;

        try {
            const data = await getProductsList(search, isActive, currentPage, pageSize, sortParam);

            setProducts(data.content || []);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements); // Guardamos el total real de la BD

        } catch (error) {
            console.error("Error cargando productos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
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
            loadProducts(page); // Recargar página actual
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col h-full">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <PackageSearch className="text-purple-600" /> Catálogo
                    </h1>
                    {/* Contador dinámico */}
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold border border-purple-200">
                        {totalElements} Productos
                    </span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600 hover:text-purple-700 transition">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={e => setShowArchived(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span>Ver Archivados</span>
                    </label>

                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition"
                    >
                        <Plus size={20} /> <span className="hidden md:inline">Nuevo</span>
                    </button>
                </div>
            </div>

            {/* BUSCADOR */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre, marca..."
                        className="w-full pl-10 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
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
                    title="Escanear código de barras"
                >
                    <ScanLine size={24} />
                </button>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mb-4">
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
                                <th onClick={() => handleSort('brand')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Marca {getSortIcon('brand')}</div>
                                </th>
                                <th onClick={() => handleSort('category')} className="p-4 cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center gap-1">Categoría {getSortIcon('category')}</div>
                                </th>
                                <th onClick={() => handleSort('price')} className="p-4 text-right cursor-pointer hover:bg-slate-100 select-none">
                                    <div className="flex items-center justify-end gap-1">Precio {getSortIcon('price')}</div>
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
                                    <tr key={p.id} className={`hover:bg-slate-50 transition ${showArchived ? 'bg-slate-50' : ''}`}>
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
                                                <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-blue-600 transition" title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleArchiveToggle(p)}
                                                className={`p-2 transition ${showArchived ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'} rounded`}
                                                title={showArchived ? "Restaurar" : "Archivar"}
                                            >
                                                {showArchived ? <RefreshCcw size={18} /> : <Archive size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 animate-pulse">
                        Cargando datos...
                    </div>
                )}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <span>Mostrar</span>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-slate-300 rounded p-1 bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>por página</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="mr-2">
                        Página <b>{page + 1}</b> de <b>{totalPages || 1}</b>
                    </span>

                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="p-2 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent bg-slate-50 transition"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1 || loading}
                        className="p-2 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent bg-slate-50 transition"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* MODALES */}
            {isModalOpen && <CreateProductModal onClose={() => setIsModalOpen(false)} onSuccess={() => loadProducts(page)} productToEdit={editingProduct} />}
            {isScannerOpen && <BarcodeScanner onScanSuccess={handleScan} onClose={() => setIsScannerOpen(false)} />}
        </div>
    );
};