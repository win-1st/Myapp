import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://javatest-production-2db4.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

api.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
