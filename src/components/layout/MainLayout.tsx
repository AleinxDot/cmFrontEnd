import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PackagePlus, LogOut, Menu, PackageSearch } from 'lucide-react';

export const MainLayout = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Barra Lateral) */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-blue-400">CmSteel</h2>
                    <p className="text-xs text-slate-400 mt-1">Sistema de Gestión</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {/* Enlaces de Navegación */}
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/sales"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <ShoppingCart size={20} />
                        Nueva Venta
                    </NavLink>

                    <NavLink
                        to="/inventory"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
                        }
                    >
                        <PackagePlus size={20} />
                        Ingreso Stock
                    </NavLink>
                    <NavLink
                        to="/catalog"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <PackageSearch size={20} />
                        Catálogo
                    </NavLink>
                    <NavLink
                        to="/quotes"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                        <PackageSearch size={20} />
                        Cotizaciones
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
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
                    <Menu className="text-slate-700" />
                    <span className="font-bold">CmSteel</span>
                </header>

                {/* Aquí se renderizarán las páginas (Dashboard, Sales, etc.) */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};