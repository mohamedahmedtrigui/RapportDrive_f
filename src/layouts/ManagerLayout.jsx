import AppShell from '../components/AppShell'
import { useAuth } from '../context/useAuth'
import { DashboardIcon, ReportsIcon, EntriesIcon, DriverIcon, ZoneIcon, DispatcherIcon } from '../components/icons'

export default function ManagerLayout() {
  const { principal, role } = useAuth()

  return (
    <AppShell
      title={principal?.name ?? 'Manager'}
      subtitle={role === 'admin' ? 'Administrateur' : 'Manager'}
      showChat
      navItems={[
        { to: '/manager/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { to: '/manager/reports', label: 'Rapports', icon: <ReportsIcon /> },
        { to: '/manager/entries', label: 'Entrées', icon: <EntriesIcon /> },
        { to: '/manager/drivers', label: 'Chauffeurs', icon: <DriverIcon /> },
        { to: '/manager/zones', label: 'Zones', icon: <ZoneIcon /> },
        { to: '/manager/dispatchers', label: 'Dispatchers', icon: <DispatcherIcon /> },
      ]}
    />
  )
}
