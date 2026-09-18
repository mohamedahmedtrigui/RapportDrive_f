import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterDispatcherPage from './pages/RegisterDispatcherPage'
import DispatcherLayout from './layouts/DispatcherLayout'
import ManagerLayout from './layouts/ManagerLayout'
import MyReportsPage from './pages/dispatcher/MyReportsPage'
import NewReportPage from './pages/dispatcher/NewReportPage'
import ReportDetailPage from './pages/dispatcher/ReportDetailPage'
import DashboardPage from './pages/manager/DashboardPage'
import EntriesListPage from './pages/manager/EntriesListPage'
import ManagerReportsListPage from './pages/manager/ManagerReportsListPage'
import ManagerReportDetailPage from './pages/manager/ManagerReportDetailPage'
import DriverDetailPage from './pages/manager/DriverDetailPage'
import DriversAdminPage from './pages/manager/DriversAdminPage'
import ZonesAdminPage from './pages/manager/ZonesAdminPage'
import DispatchersAdminPage from './pages/manager/DispatchersAdminPage'
import './App.css'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterDispatcherPage /> },
  {
    element: <ProtectedRoute requireType="dispatcher" />,
    children: [
      {
        path: '/dispatcher',
        element: <DispatcherLayout />,
        children: [
          { index: true, element: <Navigate to="reports" replace /> },
          { path: 'reports', element: <MyReportsPage /> },
          { path: 'reports/new', element: <NewReportPage /> },
          { path: 'reports/:id', element: <ReportDetailPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute requireType="user" />,
    children: [
      {
        path: '/manager',
        element: <ManagerLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'reports', element: <ManagerReportsListPage /> },
          { path: 'reports/:id', element: <ManagerReportDetailPage /> },
          { path: 'entries', element: <EntriesListPage /> },
          { path: 'drivers', element: <DriversAdminPage /> },
          { path: 'drivers/:id', element: <DriverDetailPage /> },
          { path: 'zones', element: <ZonesAdminPage /> },
          { path: 'dispatchers', element: <DispatchersAdminPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
