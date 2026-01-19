import { useEffect, useState } from 'react';
import { getDashboardStats, getLowStockProducts } from './dashboardService';
import type { DashboardStats, LowStockProduct } from './types';
import { DollarSign, ShoppingBag, AlertTriangle, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export const DashboardPage = () => {
    // Estado para KPIs Generales
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Estado para Tabla Paginada de Stock
    const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
    const [stockPage, setStockPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingStock, setLoadingStock] = useState(false);

    // 1. Cargar KPIs al inicio
    useEffect(() => {
        loadGeneralStats();
    }, []);

    // 2. Cargar/Recargar tabla cuando cambie la página
    useEffect(() => {
        loadStockTable(stockPage);
    }, [stockPage]);

    const loadGeneralStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Error dashboard", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadStockTable = async (page: number) => {
        setLoadingStock(true);
        try {
            const data = await getLowStockProducts(page, 5); // 5 items por página
            setLowStockItems(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Error stock", error);
        } finally {
            setLoadingStock(false);
        }
    };

    if (loadingStats) return <div className="p-10 text-center">Cargando dashboard...</div>;
    if (!stats) return <div className="p-10 text-center text-red-500">Error de carga</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Resumen Mensual</h1>

            {/* SECCIÓN 1: KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Card Ventas Mes */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Ventas del Mes</p>
                        <p className="text-2xl font-bold text-slate-800">S/ {stats.monthlySalesAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Card Transacciones */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Transacciones</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.monthlySalesCount}</p>
                    </div>
                </div>

                {/* Card Alertas */}
                <div className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 ${stats.lowStockTotalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                    <div className={`p-3 rounded-full ${stats.lowStockTotalCount > 0 ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Alertas de Stock</p>
                        <p className={`text-2xl font-bold ${stats.lowStockTotalCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>
                            {stats.lowStockTotalCount} Productos
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* SECCIÓN 2: Ventas por Categoría */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-purple-600" /> Top Categorías
                    </h3>
                    <div className="space-y-4">
                        {stats.salesByCategory.length === 0 ? (
                            <p className="text-sm text-slate-400">No hay ventas registradas este mes.</p>
                        ) : (
                            stats.salesByCategory.map((cat, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{cat.categoryName}</span>
                                        <span className="text-slate-600 font-bold">S/ {cat.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full"
                                            style={{ width: `${cat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SECCIÓN 3: Tabla Paginada de Stock Bajo */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-red-50 flex justify-between items-center">
                        <h3 className="font-semibold text-red-700 flex items-center gap-2">
                            <AlertTriangle size={18} /> Reposición Prioritaria
                        </h3>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loadingStock ? (
                            <div className="p-8 text-center text-sm text-slate-400">Cargando lista...</div>
                        ) : lowStockItems.length === 0 ? (
                            <div className="p-8 text-center text-green-600 font-medium">¡Inventario saludable!</div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-medium">
                                    <tr>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3 text-center">Actual</th>
                                        <th className="p-3 text-center">Mínimo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.map((product) => (
                                        <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-3 font-medium truncate max-w-[150px]" title={product.name}>{product.name}</td>
                                            <td className="p-3 text-center font-bold text-red-600">{product.stock}</td>
                                            <td className="p-3 text-center text-slate-500">{product.minStock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Footer de Paginación */}
                    {totalPages > 1 && (
                        <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                            <button
                                onClick={() => setStockPage(p => Math.max(0, p - 1))}
                                disabled={stockPage === 0 || loadingStock}
                                className="p-1 rounded hover:bg-white disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-xs font-medium text-slate-500">
                                Pág {stockPage + 1} de {totalPages}
                            </span>
                            <button
                                onClick={() => setStockPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={stockPage >= totalPages - 1 || loadingStock}
                                className="p-1 rounded hover:bg-white disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};