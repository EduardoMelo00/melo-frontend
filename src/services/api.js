// src/services/api.js
import axios from 'axios';

// Crie a instância do axios
const api = axios.create({
  baseURL: 'https://melo-backend-ba55b74f4b87.herokuapp.com/', // ou a URL do seu servidor Node
});

// Interceptor para incluir token (se existir)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  // ou sessionStorage, ou cookies etc.

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
