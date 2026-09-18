import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import { useAuth } from '../context/useAuth'
import { BellIcon } from './icons'

const POLL_INTERVAL_MS = 30000

function relativeTime(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { isDispatcher } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const load = () => {
    listNotifications().then(({ data }) => {
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    })
  }

  useEffect(() => {
    load()

    // Only poll while this tab is actually visible — a background tab left
    // open for hours shouldn't keep hitting the API every 30s for nothing.
    let interval = null

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(load, POLL_INTERVAL_MS)
      }
    }

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        load()
        startPolling()
      } else {
        stopPolling()
      }
    }

    if (document.visibilityState === 'visible') {
      startPolling()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = async (notification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id)
      load()
    }
    setOpen(false)
    if (notification.data.report_id) {
      navigate(`/${isDispatcher ? 'dispatcher' : 'manager'}/reports/${notification.data.report_id}`)
    }
  }

  const handleMarkAllRead = async (event) => {
    event.stopPropagation()
    await markAllNotificationsRead()
    load()
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
      >
        <BellIcon />
        {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="link-btn" onClick={handleMarkAllRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 && <p className="notification-empty">Aucune notification.</p>}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notification-item${n.read_at ? '' : ' unread'}`}
                onClick={() => handleItemClick(n)}
              >
                <span>{n.data.message}</span>
                <span className="notification-time">{relativeTime(n.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
