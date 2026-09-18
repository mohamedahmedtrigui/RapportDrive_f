import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // A request started before a logout/re-login can still resolve afterwards,
      // carrying the OLD (now revoked) token and legitimately getting a 401 from
      // the server. Only force a redirect if that failed token is still the
      // session's current one — otherwise this is a stale response belonging to
      // an already-superseded session and must not wipe/redirect the new one.
      const failedToken = error.config?.headers?.Authorization?.replace('Bearer ', '')
      const currentToken = sessionStorage.getItem('token')

      if (!currentToken || failedToken === currentToken) {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('principal')
        sessionStorage.removeItem('principalType')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default client
