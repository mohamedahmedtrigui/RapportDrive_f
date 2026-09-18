import AppShell from '../components/AppShell'
import { useAuth } from '../context/useAuth'
import { ReportsIcon, PlusIcon } from '../components/icons'

export default function DispatcherLayout() {
  const { principal } = useAuth()

  return (
    <AppShell
      title={principal?.nom ?? 'Dispatcher'}
      subtitle={principal?.ville_affectee}
      navItems={[
        { to: '/dispatcher/reports', label: 'Mes rapports', end: true, icon: <ReportsIcon /> },
        { to: '/dispatcher/reports/new', label: 'Nouveau rapport', icon: <PlusIcon /> },
      ]}
    />
  )
}
