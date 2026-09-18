import client from './client'

export function listDrivers(params = {}) {
  return client.get('/drivers', { params })
}

export function getDriver(id) {
  return client.get(`/drivers/${id}`)
}

export function createDriver(data) {
  return client.post('/drivers', data)
}

export function updateDriver(id, data) {
  return client.put(`/drivers/${id}`, data)
}

export function deleteDriver(id) {
  return client.delete(`/drivers/${id}`)
}

export function topCitedDrivers(params = {}) {
  return client.get('/drivers/top-cited', { params })
}
