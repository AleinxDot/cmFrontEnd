import { useEffect, useState } from 'react';
import { ShoppingBag, Printer, Eye, Search } from 'lucide-react';
import { getSalesHistory, getSaleDetail, downloadSalePdf } from './salesService';
import { QuoteDetailModal } from './QuoteDetailModal'; // Reusamos el modal de detalle
import type { SaleDetail } from './types';

export const SalesHistoryPage = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [filteredSales, setFilteredSales] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Para el modal de detalle
    const [selectedDetail, setSelectedDetail] = useState<SaleDetail | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    // Filtro buscador en tiempo real
    useEffect(() => {
        if (!search) {
            setFilteredSales(sales);
        } else {
            const lower = search.toLowerCase();
            setFilteredSales(sales.filter(s =>
                s.documentNumber.toLowerCase().includes(lower) ||
                s.customerName.toLowerCase().includes(lower)
            ));
        }
    }, [search, sales]);

    const loadData = async () => {
        try {
            const data = await getSalesHistory();
            if (Array.isArray(data)) {
                setSales(data);
                setFilteredSales(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (id: number) => {
        try {
            const detail = await getSaleDetail(id);
            setSelectedDetail(detail);
        } catch (error) {
            alert("Error cargando detalle");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingBag className="text-blue-600" /> Historial de Ventas
                </h1>

                {/* Buscador Rápido */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar Nro o Cliente..."
                        className="pl-10 w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? <div className="text-center p-10">Cargando ventas...</div> : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                            <tr>
                                <th className="p-4">Documento</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay ventas registradas.</td></tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${sale.documentNumber.startsWith('FAC') ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {sale.documentNumber}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700">{sale.customerName}</td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(sale.issueDate).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800">
                                            S/ {sale.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetail(sale.id)}
                                                className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-full"
                                                title="Ver Detalle"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => downloadSalePdf(sale.id)}
                                                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full"
                                                title="Reimprimir Ticket"
                                            >
                                                <Printer size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reusamos el Modal de Detalle que ya creamos para cotizaciones */}
            {selectedDetail && (
                <QuoteDetailModal
                    data={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                />
            )}
        </div>
    );
};