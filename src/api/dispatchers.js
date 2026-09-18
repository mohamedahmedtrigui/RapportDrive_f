import client from './client'

export function listDispatchers(params = {}) {
  return client.get('/dispatchers', { params })
}

export function createDispatcher(data) {
  return client.post('/dispatchers', data)
}

export function updateDispatcher(id, data) {
  return client.put(`/dispatchers/${id}`, data)
}

export function deleteDispatcher(id) {
  return client.delete(`/dispatchers/${id}`)
}

export function setDispatcherApproval(id, isApproved) {
  return client.patch(`/dispatchers/${id}/approval`, { is_approved: isApproved })
}
