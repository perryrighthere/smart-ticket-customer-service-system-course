import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

export const fetchHealth = async () => {
  const response = await apiClient.get('/health')
  return response.data
}
