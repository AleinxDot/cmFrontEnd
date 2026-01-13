import axios from "axios";

console.log("Backend URL:", import.meta.env.VITE_API_URL);

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


client.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Se puede forzar un logout o limpiar el token
            // localStorage.removeItem('token');
            // window.location.href = '/login';
            console.error("Sesión expirada o inválida");
        }
        return Promise.reject(error);
    }
);

export default client;