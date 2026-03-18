import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error(
    'Missing VITE_API_URL. Please add VITE_API_URL (e.g. http://localhost:5000/api) to your Frontend/.env or environment.'
  )
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error)
    }
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
      )
    }

    if (response.config.responseType === 'blob') {
      return response
    }

    // Return the backend's response envelope:
    // { success, message?, data? } or { success, count?, data }
    return response.data
  },
  (error) => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/signup', '/reset-password']
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    if (import.meta.env.DEV) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`
      )
    }

    if (error.response) {
      const status = error.response.status
      if (status === 401 && !isPublicRoute) {
        localStorage.removeItem('authToken')
      }
      return Promise.reject(error)
    }

    if (error.request) {
      error.message = 'No response from server. Please check your connection.'
    }

    return Promise.reject(error)
  }
)

export default apiClient
