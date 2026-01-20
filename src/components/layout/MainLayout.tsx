import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PackagePlus, LogOut, Menu, PackageSearch, ShoppingBag, X, Users } from 'lucide-react';
import { useState } from 'react';

export const MainLayout = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Barra Lateral) */}
            <aside
                className={`flex flex-col w-64 bg-slate-900 text-white shadow-lg 
                    fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-400">CmSteel</h2>
                        <p className="text-xs text-slate-400 mt-1">Sistema de Gestión</p>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* Enlaces de Navegación */}
                    <NavLink
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/sales"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <ShoppingCart size={20} />
                        Nueva Venta
                    </NavLink>
                    {/* Historial de Ventas */}
                    <NavLink
                        to="/sales/history"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <ShoppingBag size={20} />
                        Historial Ventas
                    </NavLink>
                    {/* Ingreso Stock */}
                    <NavLink
                        to="/inventory"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <PackagePlus size={20} />
                        Ingreso Stock
                    </NavLink>
                    {/* Catálogo */}
                    <NavLink
                        to="/catalog"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <PackageSearch size={20} />
                        Catálogo
                    </NavLink>
                    {/* Cotizaciones */}
                    <NavLink
                        to="/quotes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <PackageSearch size={20} />
                        Cotizaciones
                    </NavLink>
                    {/* Clientes */}
                    <NavLink
                        to="/customers"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <Users size={20} />
                        Clientes
                    </NavLink>
                </nav>

                {/* Footer del Sidebar */}
                <div className="p-4 border-t border-slate-700">
                    <div className="mb-4 px-2">
                        <p className="text-sm font-medium text-white">{username}</p>
                        <p className="text-xs text-slate-400">{role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Área de Contenido Principal */}
            <main className="flex-1 overflow-auto flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden shrink-0">
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="text-slate-700" size={24} />
                    </button>
                    <span className="font-bold text-lg text-slate-800">CmSteel</span>
                    {/* Placeholder for symmetry or add useful logic here */}
                    <div className="w-6" />
                </header>

                {/* Aquí se renderizarán las páginas (Dashboard, Sales, etc.) */}
                <div className="p-4 md:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};