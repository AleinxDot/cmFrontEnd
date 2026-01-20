import React, { useState } from 'react';
import { X, Save, Truck, Search, Loader2 } from 'lucide-react';
import { createSupplier, consultExternalSupplier } from './supplierService';

interface Props {
    onClose: () => void;
    onSuccess: (newSupplier: any) => void;
}

export const CreateSupplierModal = ({ onClose, onSuccess }: Props) => {
    const [formData, setFormData] = useState({
        ruc: '',
        name: '',
        address: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // BÚSQUEDA API
    const handleSearchDoc = async () => {
        if (!formData.ruc || formData.ruc.length < 8) {
            alert("Ingresa un RUC válido");
            return;
        }

        setSearching(true);
        try {
            const data = await consultExternalSupplier(formData.ruc);

            if (data.status && data.status !== 'ACTIVO') {
                alert(`⚠️ Proveedor en estado: ${data.status}`);
            }

            setFormData(prev => ({
                ...prev,
                name: data.name,
                address: data.address || prev.address
            }));
        } catch (error) {
            console.error(error);
            alert("No se encontraron datos del proveedor");
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createSupplier(formData);
            alert("Proveedor registrado exitosamente");
            onSuccess(result);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar proveedor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2">
                        <Truck size={20} /> Nuevo Proveedor
                    </h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* RUC + BUSCADOR */}
                    <div>
                        <label className="text-xs font-bold text-slate-500">RUC / DNI</label>
                        <div className="flex gap-2">
                            <input
                                required
                                type="text"
                                maxLength={11}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.ruc}
                                onChange={e => setFormData({ ...formData, ruc: e.target.value })}
                                placeholder="Ingresa RUC..."
                            />
                            <button
                                type="button"
                                onClick={handleSearchDoc}
                                disabled={searching}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition disabled:opacity-50"
                                title="Consultar SUNAT"
                            >
                                {searching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500">Razón Social</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500">Dirección</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Teléfono</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 transition"
                        >
                            <Save size={20} /> {loading ? 'Guardando...' : 'GUARDAR PROVEEDOR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};