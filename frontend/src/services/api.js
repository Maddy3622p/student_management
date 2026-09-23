import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 5000 });
export const fetchResource = (resource) => api.get(`/${resource}`).then((response) => response.data);
export const createResource = (resource, payload) => api.post(`/${resource}`, payload).then((response) => response.data);
export const updateResource = (resource, id, payload) => api.put(`/${resource}/${id}`, payload).then((response) => response.data);
export const removeResource = (resource, id) => api.delete(`/${resource}/${id}`).then((response) => response.data);
export const fetchDashboard = () => api.get('/dashboard').then((response) => response.data);
export default api;
