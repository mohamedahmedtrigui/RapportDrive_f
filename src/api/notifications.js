import client from './client'

export function listNotifications() {
  return client.get('/notifications')
}

export function markNotificationRead(id) {
  return client.patch(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return client.patch('/notifications/read-all')
}
