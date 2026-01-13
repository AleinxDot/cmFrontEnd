import { useState, useEffect } from 'react';
import { PackageSearch, Plus, Edit } from 'lucide-react';
import client from '../../api/client';
import { CreateProductModal } from './CreateProductModal';

export const ProductListPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    // Control del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async (query = '') => {
        const url = query ? `/products?search=${query}&size=20` : `/products?size=20`;
        const res = await client.get(url);
        setProducts(res.data.content);
    };
    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <PackageSearch className="text-purple-600" /> Gestión de Catálogo
                </h1>
                <button
                    onClick={handleCreate}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* Buscador */}
            <input
                type="text"
                placeholder="Buscar por nombre o marca..."
                className="w-full p-3 border border-slate-300 rounded-lg mb-4"
                value={search}
                onChange={(e) => { setSearch(e.target.value); loadProducts(e.target.value); }}
            />

            {/* Tabla */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                        <tr>
                            <th className="p-4">Código</th>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Marca</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4 text-right">Precio</th>
                            <th className="p-4 text-center">Stock</th>
                            <th className="p-4 text-center">Acciones</th> {/* Nueva Columna */}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                {/* ... Celdas anteriores igual ... */}
                                <td className="p-4 font-mono text-xs text-slate-500">{p.barcode}</td>
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4 text-slate-600">{p.brandName}</td>
                                <td className="p-4 text-slate-600">{p.categoryName}</td>
                                <td className="p-4 text-right font-bold text-blue-600">S/ {p.price.toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                {/* Botón Editar */}
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <CreateProductModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => loadProducts(search)}
                    productToEdit={editingProduct}
                />
            )}
        </div>
    );
};