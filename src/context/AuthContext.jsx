import { useMemo, useState } from 'react'
import { loginDispatcher, loginUser, logout as apiLogout } from '../api/auth'
import AuthContext from './auth-context'

function readStoredPrincipal() {
  const raw = sessionStorage.getItem('principal')
  return raw ? JSON.parse(raw) : null
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [principal, setPrincipal] = useState(readStoredPrincipal)
  const [principalType, setPrincipalType] = useState(() => sessionStorage.getItem('principalType'))

  const persist = (nextToken, nextPrincipal, nextType) => {
    sessionStorage.setItem('token', nextToken)
    sessionStorage.setItem('principal', JSON.stringify(nextPrincipal))
    sessionStorage.setItem('principalType', nextType)
    setToken(nextToken)
    setPrincipal(nextPrincipal)
    setPrincipalType(nextType)
  }

  const loginAsDispatcher = async (email, password) => {
    const { data } = await loginDispatcher(email, password)
    persist(data.token, data.dispatcher, 'dispatcher')
    return data.dispatcher
  }

  const loginAsUser = async (email, password) => {
    const { data } = await loginUser(email, password)
    persist(data.token, data.user, 'user')
    return data.user
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Token might already be invalid/expired; clear local state regardless.
    }
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('principal')
    sessionStorage.removeItem('principalType')
    setToken(null)
    setPrincipal(null)
    setPrincipalType(null)
  }

  const value = useMemo(
    () => ({
      token,
      principal,
      principalType,
      isAuthenticated: Boolean(token),
      isDispatcher: principalType === 'dispatcher',
      isManager: principalType === 'user',
      role: principalType === 'user' ? principal?.role : null,
      loginAsDispatcher,
      loginAsUser,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, principal, principalType],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
