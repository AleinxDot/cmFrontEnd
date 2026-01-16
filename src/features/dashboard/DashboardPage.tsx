import { useEffect, useState } from 'react';
import { getDashboardStats } from './dashboardService';
import type { DashboardStats } from './types';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Error cargando dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Cargando estadísticas...</div>;
    if (!stats) return <div className="text-center p-10 text-red-500">Error al cargar datos</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Resumen del Día</h1>

            {/* Tarjetas de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Card 1: Ventas en Dinero */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Ventas Hoy</p>
                        <p className="text-2xl font-bold text-slate-800">S/ {stats.todaySalesAmount.toFixed(2)}</p>
                    </div>
                </div>

                {/* Card 2: Cantidad de Ventas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Transacciones</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.todaySalesCount}</p>
                    </div>
                </div>

                {/* Card 3: Alertas de Stock */}
                <div className={`p-6 rounded-xl shadow-sm border flex items-center gap-4 
            ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                    <div className={`p-3 rounded-full ${stats.lowStockCount > 0 ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Stock Bajo</p>
                        <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>
                            {stats.lowStockCount} Productos
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabla de Alertas de Stock */}
            {stats.lowStockCount > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                        <h3 className="font-semibold text-red-700 flex items-center gap-2">
                            <AlertTriangle size={18} /> Productos que requieren reposición
                        </h3>
                    </div>
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-medium">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4 text-center">Stock Actual</th>
                                <th className="p-4 text-center">Mínimo Permitido</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.lowStockProducts.map((product) => (
                                <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="p-4 font-medium">{product.name}</td>
                                    <td className="p-4 text-center font-bold text-red-600">{product.stock}</td>
                                    <td className="p-4 text-center text-slate-500">{product.minStock}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-blue-600 hover:underline">Ingresar Stock</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {stats.lowStockCount === 0 && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center text-green-800 flex flex-col items-center">
                    <TrendingUp size={40} className="mb-2 opacity-50" />
                    <p>¡Todo en orden! No tienes alertas de inventario hoy.</p>
                </div>
            )}

        </div>
    );
};