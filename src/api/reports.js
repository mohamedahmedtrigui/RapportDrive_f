import client from './client'

export function listReports(params = {}) {
  return client.get('/reports', { params })
}

export function getReport(id) {
  return client.get(`/reports/${id}`)
}

export function createReport(data) {
  return client.post('/reports', data)
}

export function updateReport(id, data) {
  return client.put(`/reports/${id}`, data)
}

export function updateReportStatus(id, statut) {
  return client.patch(`/reports/${id}/status`, { statut })
}

export function deleteReport(id) {
  return client.delete(`/reports/${id}`)
}

export function analyzeReport(id) {
  return client.post(`/reports/${id}/analyze`)
}

export function markAiSummaryRead(id) {
  return client.patch(`/reports/${id}/ai-summary/read`)
}
