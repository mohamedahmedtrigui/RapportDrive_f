import client from './client'

export function registerDispatcher(data) {
  return client.post('/auth/dispatcher/register', data)
}

export function loginDispatcher(email, password) {
  return client.post('/auth/dispatcher/login', { email, password })
}

export function loginUser(email, password) {
  return client.post('/auth/login', { email, password })
}

export function logout() {
  return client.post('/auth/logout')
}
