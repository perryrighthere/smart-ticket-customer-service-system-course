import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export const fetchHealth = async () => {
  const response = await apiClient.get('/health')
  return response.data
}
