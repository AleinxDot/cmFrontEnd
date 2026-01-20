import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, ChevronLeft, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { getCustomersList } from './customerService';
import { CreateCustomerModal } from './CreateCustomerModal';

export const CustomersPage = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Paginación y Filtros
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

    useEffect(() => {
        loadCustomers();
    }, [page, search]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await getCustomersList(page, 10, search);
            setCustomers(data.content || []);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Error cargando clientes", error);
        } finally {
            setLoading(false);
        }
    };

    // Resetear página al buscar
    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(0);
    };

    const openCreate = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const openEdit = (customer: any) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Gestión de Clientes
                    </h1>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {totalElements} Total
                    </span>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition"
                >
                    <Plus size={20} /> Nuevo Cliente
                </button>
            </div>

            {/* BUSCADOR */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, RUC o DNI..."
                    className="w-full pl-10 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* TABLA DE CLIENTES */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b text-sm uppercase">
                            <tr>
                                <th className="p-4">Cliente / Razón Social</th>
                                <th className="p-4">Documento</th>
                                <th className="p-4">Contacto</th>
                                <th className="p-4">Dirección</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Cargando...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-slate-400">No se encontraron clientes.</td></tr>
                            ) : (
                                customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{c.name}</p>
                                            {c.email && (
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail size={12} /> {c.email}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-sm border">
                                                {c.docNumber}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {c.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-green-600" /> {c.phone}
                                                </div>
                                            ) : <span className="text-slate-300 italic">Sin teléfono</span>}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 max-w-xs truncate">
                                            {c.address ? (
                                                <div className="flex items-center gap-1" title={c.address}>
                                                    <MapPin size={14} className="text-red-400" /> {c.address}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => openEdit(c)}
                                                className="p-2 text-slate-400 hover:text-blue-600 transition bg-slate-50 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 0 && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 text-sm">
                        <span className="text-slate-500">Página {page + 1} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0 || loading}
                                className="p-2 border rounded hover:bg-white disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1 || loading}
                                className="p-2 border rounded hover:bg-white disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <CreateCustomerModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => loadCustomers()} // Recargar tabla
                    customerToEdit={editingCustomer}
                />
            )}
        </div>
    );
};