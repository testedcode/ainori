import axios from 'axios'

// In browser and server: always use /api for internal Next.js serverless routes
function getApiBaseUrl(): string {
  return '/api'
}

// Create axios instance
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (data: any) =>
    apiClient.post('/auth/register', data),

  getProfile: () =>
    apiClient.get('/auth/profile'),

  // Stats
  get: (endpoint: string) =>
    apiClient.get(endpoint),

  post: (endpoint: string, data?: any) =>
    apiClient.post(endpoint, data),

  put: (endpoint: string, data?: any) =>
    apiClient.put(endpoint, data),

  delete: (endpoint: string) =>
    apiClient.delete(endpoint),
}

export default apiClient

