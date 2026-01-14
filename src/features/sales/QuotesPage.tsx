import { useEffect, useState } from 'react';
import { FileText, CheckCircle, Eye, Archive, Printer } from 'lucide-react'; // Iconos
import { getQuotes, convertQuote, archiveQuote, getSaleDetail, downloadSalePdf } from './salesService';
import { QuoteDetailModal } from './QuoteDetailModal';
import type { SaleDetail } from './types';

export const QuotesPage = () => {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false); // Filtro

    // Estado para el Modal de Detalle
    const [selectedDetail, setSelectedDetail] = useState<SaleDetail | null>(null);

    useEffect(() => {
        loadData();
    }, [showArchived]); // Recargar si cambia el filtro

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getQuotes(showArchived); // Pasamos el filtro
            if (Array.isArray(data)) setQuotes(data);
            else setQuotes([]);
        } catch (error) {
            console.error(error);
            setQuotes([]);
        } finally {
            setLoading(false);
        }
    };

    // Ver Detalle (Abre Modal)
    const handleViewDetail = async (id: number) => {
        try {
            const detail = await getSaleDetail(id);
            setSelectedDetail(detail);
        } catch (error) {
            alert("Error al cargar detalle");
        }
    };

    // Archivar
    const handleArchive = async (id: number) => {
        if (!confirm("¿Deseas archivar esta cotización? (Desaparecerá de la lista principal)")) return;
        try {
            await archiveQuote(id);
            loadData(); // Refrescar lista
        } catch (error) {
            alert("Error al archivar");
        }
    };

    // Convertir (Ya lo tenías)
    const handleConvert = async (id: number, type: 'BOLETA' | 'FACTURA') => {
        if (!confirm(`¿Convertir en ${type} y descontar stock?`)) return;
        try {
            await convertQuote(id, type);
            alert("¡Venta generada!");
            loadData();
        } catch (error: any) {
            alert("Error: " + (error.response?.data?.error || "Stock insuficiente"));
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-purple-600" /> Cotizaciones
                </h1>

                {/* Filtro de Archivados */}
                <label className="flex items-center gap-2 cursor-pointer select-none border border-slate-300 p-2 rounded-lg hover:bg-slate-50">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={e => setShowArchived(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Mostrar Archivados</span>
                </label>
            </div>

            {loading ? <div className="text-center p-10">Cargando...</div> : (
                <div className="grid gap-4">
                    {quotes.length === 0 && <p className="text-slate-500 text-center py-10">No se encontraron cotizaciones.</p>}

                    {quotes.map((q) => (
                        <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 transition hover:shadow-md">

                            {/* Datos Principales */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-mono font-bold text-slate-700">{q.documentNumber}</span>
                                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">COTIZACIÓN</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Cliente: <span className="font-semibold">{q.customerName}</span>
                                </p>
                                <p className="text-xs text-slate-400">
                                    {new Date(q.issueDate).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Total */}
                            <div className="text-right px-4 md:border-l md:border-r border-slate-100 min-w-[120px]">
                                <p className="text-xs text-slate-500 uppercase font-bold">Total</p>
                                <p className="text-xl font-bold text-slate-800">S/ {q.totalAmount.toFixed(2)}</p>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2">
                                {/* Botón VER */}
                                <button onClick={() => handleViewDetail(q.id)} className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition" title="Ver Detalle">
                                    <Eye size={20} />
                                </button>

                                {/* Botón IMPRIMIR */}
                                <button onClick={() => downloadSalePdf(q.id)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition" title="Imprimir PDF">
                                    <Printer size={20} />
                                </button>

                                {/* Botón ARCHIVAR */}
                                <button onClick={() => handleArchive(q.id)} className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition" title="Archivar">
                                    <Archive size={20} />
                                </button>

                                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                                {/* Botones de Conversión */}
                                <button onClick={() => handleConvert(q.id, 'BOLETA')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={14} /> BOLETA
                                </button>
                                <button onClick={() => handleConvert(q.id, 'FACTURA')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={14} /> FACTURA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Renderizar Modal si hay selección */}
            {selectedDetail && (
                <QuoteDetailModal
                    data={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                />
            )}
        </div>
    );
};