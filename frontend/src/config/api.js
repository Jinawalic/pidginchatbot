// API Configuration
const API_BASE_URL_RAW = import.meta.env.VITE_API_URL || '/api';
const API_BASE_URL = API_BASE_URL_RAW.replace(/\/+$|\s+$/, '');

export const apiCall = (endpoint, options = {}) => {
    if (endpoint.startsWith('http')) {
        return fetch(endpoint, options);
    }

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return fetch(`${API_BASE_URL}${path}`, options);
};

export default API_BASE_URL;
