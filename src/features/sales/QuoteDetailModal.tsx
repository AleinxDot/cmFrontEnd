import { X, Calendar, User } from 'lucide-react';
import type { SaleDetail } from './types';

interface Props {
    data: SaleDetail;
    onClose: () => void;
}

export const QuoteDetailModal = ({ data, onClose }: Props) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">

                {/* Cabecera */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Detalle de Cotización</h2>
                        <p className="text-xs text-slate-400">{data.documentNumber}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Info Cliente y Fecha */}
                <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Cliente</p>
                            <p className="font-bold text-slate-800">{data.customerName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Calendar size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Fecha de Emisión</p>
                            <p className="font-bold text-slate-800">{new Date(data.issueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-3">Producto</th>
                                <th className="p-3 text-center">Cant.</th>
                                <th className="p-3 text-right">Precio Unit.</th>
                                <th className="p-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-3 font-medium text-slate-700">{item.productName}</td>
                                    <td className="p-3 text-center text-slate-500">{item.quantity}</td>
                                    <td className="p-3 text-right text-slate-500">S/ {item.unitPrice.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold text-slate-800">S/ {item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t border-slate-200">
                            <tr>
                                <td colSpan={3} className="p-4 text-right font-bold text-slate-600">TOTAL:</td>
                                <td className="p-4 text-right font-bold text-xl text-blue-600">S/ {data.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded text-slate-800 font-medium">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};