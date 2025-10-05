import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const res = await axios.post(`${apiUrl}/auth/refreshToken`, {}, { withCredentials: true })

        const newToken = res.data?.token
        if (newToken) {
          localStorage.setItem('token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError)
        clearAuthStorage()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401) {
      const { code } = error.response.data || {}
      if (['TOKEN_MISSING', 'INVALID_TOKEN'].includes(code)) {
        clearAuthStorage()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

const clearAuthStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('rolId')
  localStorage.removeItem('roleName')
  localStorage.removeItem('apiData')
  localStorage.removeItem('userDetail')
}

export default axiosInstance
