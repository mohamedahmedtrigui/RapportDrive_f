import client from './client'

export function listZones(params = {}) {
  return client.get('/zones', { params })
}

export function createZone(data) {
  return client.post('/zones', data)
}

export function updateZone(id, data) {
  return client.put(`/zones/${id}`, data)
}

export function deleteZone(id) {
  return client.delete(`/zones/${id}`)
}
