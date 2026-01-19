import { Navigate, Outlet } from 'react-router-dom';
// Protege las rutas que requieren autenticación
export const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};