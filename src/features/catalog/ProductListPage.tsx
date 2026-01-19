import { useState, useEffect } from 'react';
import { PackageSearch, Plus, Edit, Archive, RefreshCcw, Search, Camera, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductsList, toggleProductArchive } from './catalogService';
import { CreateProductModal } from './CreateProductModal';
import { BarcodeScanner } from '../../components/ui/BarcodeScanner';

export const ProductListPage = () => {
    // Estados de datos
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados de filtros
    const [search, setSearch] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Estados de paginación
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    //Configuracion de orden
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    // Control del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Camara
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProducts();
        }, 300); // Debounce para búsqueda
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, showArchived, page, size, sortConfig]);

    const loadProducts = async () => {
        setLoading(true);
        const status = showArchived ? 'ARCHIVED' : 'ACTIVE';
        // Formato para Spring Boot: "campo,direccion" (ej: "price,asc")
        const sortParam = `${sortConfig.key},${sortConfig.direction}`;

        try {
            const data = await getProductsList(search, status, page, size, sortParam);
            setProducts(data.content || []);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Error cargando productos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        // Si ya estamos ordenando por esta columna, invertimos la dirección
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

    const handleArchiveToggle = async (product: any) => {
        const action = showArchived ? "RESTAURAR" : "ARCHIVAR";
        if (!confirm(`¿Seguro que deseas ${action} el producto "${product.name}"?`)) return;

        try {
            await toggleProductArchive(product.id);
            loadProducts(); // Recargar lista
        } catch (error) {
            alert("Error al actualizar estado");
        }
    };

    // --- FUNCIÓN AL ESCANEAR ---
    const handleScan = (code: string) => {
        setSearch(code);       // 1. Pone el código en el buscador
        setIsScannerOpen(false); // 2. Cierra la cámara
        // El useEffect detectará el cambio en 'search' y buscará automáticamente
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <PackageSearch className="text-purple-600" /> Catálogo de Productos
                </h1>

                <div className="flex items-center gap-4">
                    {/* Filtro Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600 hover:text-slate-800">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={e => setShowArchived(e.target.checked)}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        Mostrar Archivados
                    </label>

                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition"
                    >
                        <Plus size={20} /> Nuevo
                    </button>
                </div>
            </div>

            {/* Buscador */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre..."
                        className="w-full pl-10 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* Botón 'X' para limpiar búsqueda rápida */}
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* BOTÓN DE CÁMARA */}
                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-slate-800 text-white p-3 rounded-lg hover:bg-slate-700 transition shadow-sm flex items-center justify-center min-w-[50px]"
                    title="Escanear Código de Barras"
                >
                    <Camera size={24} />
                </button>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-sm uppercase">
                            <tr>
                                {/* COLUMNAS ORDENABLES */}
                                <th onClick={() => handleSort('barcode')} className="p-4 cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center gap-1">Código {getSortIcon('barcode')}</div>
                                </th>
                                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center gap-1">Producto {getSortIcon('name')}</div>
                                </th>
                                <th onClick={() => handleSort('brand.name')} className="p-4 cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center gap-1">Marca {getSortIcon('brand.name')}</div>
                                </th>
                                <th onClick={() => handleSort('category.name')} className="p-4 cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center gap-1">Categoría {getSortIcon('category.name')}</div>
                                </th>
                                <th onClick={() => handleSort('unitPrice')} className="p-4 text-right cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center justify-end gap-1">Precio {getSortIcon('unitPrice')}</div>
                                </th>
                                <th onClick={() => handleSort('stock')} className="p-4 text-center cursor-pointer hover:bg-slate-100 transition select-none">
                                    <div className="flex items-center justify-center gap-1">Stock {getSortIcon('stock')}</div>
                                </th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-slate-500">Cargando datos...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-slate-400">No hay productos.</td></tr>
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
                                                <button
                                                    onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                                                    className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleArchiveToggle(p)}
                                                className={`p-2 rounded-full transition ${showArchived ? 'text-green-500 hover:text-green-700' : 'text-slate-400 hover:text-red-500'}`}
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

                {/* --- BARRA DE PAGINACIÓN --- */}
                <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Selector de Tamaño */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Mostrar</span>
                        <select
                            value={size}
                            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                            className="border border-slate-300 rounded p-1 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span>por página</span>
                    </div>

                    {/* Controles de Página */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 mr-2">
                            Página {page + 1} de {totalPages || 1}
                        </span>

                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CreateProductModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadProducts}
                    productToEdit={editingProduct}
                />
            )}

            {/* MODAL SCANNER */}
            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

        </div>
    );
};