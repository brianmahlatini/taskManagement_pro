import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? 'http://localhost:5000/api' : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Debug logging
console.log('Axios baseURL:', import.meta.env.PROD ? 'http://localhost:5000/api' : '/api');
console.log('Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Expected backend URL should be: http://localhost:5000/api');

api.interceptors.request.use(
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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 (Unauthorized) - maybe refresh token logic here later
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
