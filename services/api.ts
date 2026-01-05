import axios from 'axios';

const api = axios.create({
    baseURL: 'https://javatest-production-2db4.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

export default api;
