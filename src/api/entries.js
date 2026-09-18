import client from './client'

export function addEntry(reportId, data) {
  return client.post(`/reports/${reportId}/entries`, data)
}

export function updateEntry(reportId, entryId, data) {
  return client.put(`/reports/${reportId}/entries/${entryId}`, data)
}

export function deleteEntry(reportId, entryId) {
  return client.delete(`/reports/${reportId}/entries/${entryId}`)
}

export function searchEntries(params = {}) {
  return client.get('/entries/search', { params })
}

export function getDashboardStats() {
  return client.get('/dashboard/stats')
}
