import React, { useEffect, useState } from 'react';
import { X, Plus, Save, Camera } from 'lucide-react'; // <--- Agregamos 'Camera'
import { getBrands, getCategories, createBrand, createProduct, createCategory, updateProduct } from './catalogService';
import type { DropdownItem, ProductPayload } from './types';
import { BarcodeScanner } from '../../components/ui/BarcodeScanner'; // <--- Importamos el Escáner

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: any;
}

export const CreateProductModal = ({ onClose, onSuccess, productToEdit }: Props) => {
    const [brands, setBrands] = useState<DropdownItem[]>([]);
    const [categories, setCategories] = useState<DropdownItem[]>([]);

    const [form, setForm] = useState<ProductPayload>({
        barcode: '', name: '', brandId: 0, categoryId: 0, price: 0, minStock: 5
    });

    // Estados para Marca Rápida
    const [showBrandInput, setShowBrandInput] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');

    // Estados para Categoría Rápida
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Estado para el Escáner
    const [isScannerOpen, setIsScannerOpen] = useState(false); // <--- Nuevo Estado

    useEffect(() => {
        loadMetadata();
        if (productToEdit) {
            setForm({
                barcode: productToEdit.barcode,
                name: productToEdit.name,
                brandId: productToEdit.brandId,
                categoryId: productToEdit.categoryId,
                price: productToEdit.price,
                minStock: productToEdit.minStock
            });
        }
    }, [productToEdit]);

    const loadMetadata = async () => {
        const [b, c] = await Promise.all([getBrands(), getCategories()]);
        setBrands(b);
        setCategories(c);
    };

    const handleSaveBrand = async () => {
        if (!newBrandName) return;
        const newBrand = await createBrand(newBrandName);
        setBrands([...brands, newBrand]);
        setForm(prev => ({ ...prev, brandId: newBrand.id }));
        setShowBrandInput(false);
        setNewBrandName('');
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName) return;
        const newCat = await createCategory(newCategoryName);
        setCategories([...categories, newCat]);
        setForm(prev => ({ ...prev, categoryId: newCat.id }));
        setShowCategoryInput(false);
        setNewCategoryName('');
    };

    // Función que recibe el código escaneado
    const handleScan = (code: string) => {
        setForm(prev => ({ ...prev, barcode: code })); // Rellena el input
        setIsScannerOpen(false); // Cierra el escáner
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (productToEdit) {
                await updateProduct(productToEdit.id, form);
                alert("Producto actualizado correctamente");
            } else {
                await createProduct(form);
                alert("Producto creado exitosamente");
            }
            onSuccess();
            onClose();
        } catch (error) {
            alert("Error al guardar producto (Verifica que el código no exista ya)");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">

                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                    <h2 className="font-bold">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Código y Nombre */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Código Barras</label>
                            <div className="flex gap-2">
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={form.barcode}
                                    onChange={e => setForm({ ...form, barcode: e.target.value })}
                                    placeholder="Escanear o escribir..."
                                />
                                {/* BOTÓN DE ESCÁNER */}
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="bg-slate-200 text-slate-700 p-2 rounded hover:bg-slate-300 transition"
                                    title="Escanear Código"
                                >
                                    <Camera size={20} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Nombre</label>
                            <input required type="text" className="w-full p-2 border rounded"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                    </div>

                    {/* SECCIÓN MARCA */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 flex justify-between">
                            Marca
                            {!showBrandInput && (
                                <span onClick={() => setShowBrandInput(true)} className="text-blue-600 cursor-pointer flex items-center gap-1 text-[10px] hover:underline">
                                    <Plus size={12} /> Nueva Marca
                                </span>
                            )}
                        </label>
                        {showBrandInput ? (
                            <div className="flex gap-2 mt-1">
                                <input autoFocus type="text" placeholder="Nombre marca" className="flex-1 p-2 border border-blue-300 rounded"
                                    value={newBrandName} onChange={e => setNewBrandName(e.target.value)} />
                                <button type="button" onClick={handleSaveBrand} className="bg-blue-600 text-white p-2 rounded text-xs font-bold">OK</button>
                                <button type="button" onClick={() => setShowBrandInput(false)} className="text-slate-500 p-2 text-xs">X</button>
                            </div>
                        ) : (
                            <select required className="w-full p-2 border rounded mt-1"
                                value={form.brandId} onChange={e => setForm({ ...form, brandId: parseInt(e.target.value) })}>
                                <option value="">Seleccione Marca...</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        )}
                    </div>

                    {/* SECCIÓN CATEGORÍA */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 flex justify-between">
                            Categoría
                            {!showCategoryInput && (
                                <span onClick={() => setShowCategoryInput(true)} className="text-blue-600 cursor-pointer flex items-center gap-1 text-[10px] hover:underline">
                                    <Plus size={12} /> Nueva Categoría
                                </span>
                            )}
                        </label>
                        {showCategoryInput ? (
                            <div className="flex gap-2 mt-1">
                                <input autoFocus type="text" placeholder="Nombre categoría" className="flex-1 p-2 border border-blue-300 rounded"
                                    value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                                <button type="button" onClick={handleSaveCategory} className="bg-blue-600 text-white p-2 rounded text-xs font-bold">OK</button>
                                <button type="button" onClick={() => setShowCategoryInput(false)} className="text-slate-500 p-2 text-xs">X</button>
                            </div>
                        ) : (
                            <select required className="w-full p-2 border rounded mt-1"
                                value={form.categoryId} onChange={e => setForm({ ...form, categoryId: parseInt(e.target.value) })}>
                                <option value="">Seleccione Categoría...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                    </div>

                    {/* Precio y Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500">Precio Venta (S/)</label>
                            <input required type="number" step="0.01" className="w-full p-2 border rounded"
                                value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Stock Mínimo</label>
                            <input required type="number" className="w-full p-2 border rounded"
                                value={form.minStock} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex justify-center gap-2 transition">
                            <Save size={20} /> GUARDAR PRODUCTO
                        </button>
                    </div>
                </form>
            </div>

            {/* Renderizado condicional del Escáner */}
            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
};