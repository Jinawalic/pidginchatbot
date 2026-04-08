// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiCall = (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return fetch(url, options);
};

export default API_BASE_URL;
