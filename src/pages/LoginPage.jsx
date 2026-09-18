import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { firstValidationError } from '../utils/errors'
import { LogoIcon } from '../components/icons'

export default function LoginPage() {
  const [type, setType] = useState('dispatcher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const { loginAsDispatcher, loginAsUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (type === 'dispatcher') {
        await loginAsDispatcher(email, password)
        navigate('/dispatcher/reports')
      } else {
        await loginAsUser(email, password)
        navigate('/manager/dashboard')
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setError(firstValidationError(err, 'Identifiants incorrects.'))
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifie que le backend est démarré.')
      } else {
        setError('Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">
            <LogoIcon />
          </span>
          <h1 style={{ margin: 0 }}>RapportDrive</h1>
        </div>
        <div className="tabs">
          <button
            type="button"
            className={type === 'dispatcher' ? 'active' : ''}
            onClick={() => setType('dispatcher')}
          >
            Dispatcher
          </button>
          <button
            type="button"
            className={type === 'user' ? 'active' : ''}
            onClick={() => setType('user')}
          >
            Manager / Admin
          </button>
        </div>

        <form className="stacked" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        {type === 'dispatcher' && (
          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Pas encore de compte ? <Link to="/register">Créer un compte dispatcher</Link>
          </p>
        )}
      </div>
    </div>
  )
}
