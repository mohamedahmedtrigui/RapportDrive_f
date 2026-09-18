import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, LogoutIcon } from './icons'
import ChatWidget from './ChatWidget'
import NotificationBell from './NotificationBell'

export default function AppShell({ title, subtitle, navItems, showChat = false }) {
  const [navOpen, setNavOpen] = useState(false)
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <header className="navbar">
        <button
          type="button"
          className="icon-btn navbar-menu-btn"
          onClick={() => setNavOpen((o) => !o)}
          aria-label={navOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {navOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className="navbar-brand">
          <span className="brand-mark">
            <img src="/rapport.png" alt="RapportDrive" />
          </span>
          <span className="brand-name">RapportDrive</span>
        </div>

        <div className="navbar-spacer" />

        <NotificationBell />
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Changer de thème">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className={`shell-body${navOpen ? ' nav-open' : ''}`}>
        <button
          type="button"
          className="backdrop"
          aria-label="Fermer le menu"
          onClick={() => setNavOpen(false)}
        />

        <nav className="sidebar">
          <div className="sidebar-user">
            <div className="sidebar-title">{title}</div>
            {subtitle && <div className="sidebar-subtitle">{subtitle}</div>}
          </div>

          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-footer">
            <button type="button" className="nav-link logout" onClick={logout}>
              <LogoutIcon />
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>

        <main className="main">
          <Outlet />
        </main>
      </div>

      {showChat && <ChatWidget />}
    </div>
  )
}
