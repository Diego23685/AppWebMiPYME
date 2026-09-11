import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5206/api', // Ajustar al puerto de lanzamiento dotnet
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});