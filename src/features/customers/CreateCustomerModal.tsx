import React, { useState } from 'react';
import { X, Save, User, FileText, Phone, MapPin } from 'lucide-react';
import { createCustomer } from './customerService';
import type { CreateCustomerRequest, Customer } from './types';

interface Props {
    onClose: () => void;
    onSuccess: (customer: Customer) => void; // Devolvemos el cliente creado para seleccionarlo
}

export const CreateCustomerModal = ({ onClose, onSuccess }: Props) => {
    const [form, setForm] = useState<CreateCustomerRequest>({
        name: '', docNumber: '', email: '', phone: '', address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newCustomer = await createCustomer(form);
            onSuccess(newCustomer); // Pasamos el cliente creado al padre
            onClose();
        } catch (error) {
            alert("Error al crear cliente. Verifique si el DNI/RUC ya existe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><User size={20} /> Nuevo Cliente</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Documento y Nombre */}
                    <div>
                        <label className="text-xs font-bold text-slate-500">DNI / RUC *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input required type="text" className="pl-10 w-full p-2 border rounded"
                                value={form.docNumber} onChange={e => setForm({ ...form, docNumber: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Nombre / Razón Social *</label>
                        <input required type="text" className="w-full p-2 border rounded"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>

                    {/* Teléfono y Dirección */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input type="text" className="pl-10 w-full p-2 border rounded"
                                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Email</label>
                            <input type="email" className="w-full p-2 border rounded"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input type="text" className="pl-10 w-full p-2 border rounded"
                                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2">
                            {loading ? 'Guardando...' : <><Save size={20} /> GUARDAR CLIENTE</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};