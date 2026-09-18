import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerDispatcher } from '../api/auth'
import { firstValidationError } from '../utils/errors'
import { LogoIcon } from '../components/icons'

export default function RegisterDispatcherPage() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [villeAffectee, setVilleAffectee] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data } = await registerDispatcher({
        nom,
        email,
        ville_affectee: villeAffectee,
        password,
      })
      setSuccess(data.message)
    } catch (err) {
      setError(firstValidationError(err, "Impossible de créer le compte."))
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

        {success ? (
          <div>
            <p style={{ marginBottom: 16 }}>{success}</p>
            <Link to="/login" className="btn secondary" style={{ display: 'inline-flex' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h2>Créer un compte dispatcher</h2>
            <form className="stacked" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="nom">Nom</label>
                <input id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
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
                <label htmlFor="ville_affectee">Ville affectée</label>
                <input
                  id="ville_affectee"
                  required
                  value={villeAffectee}
                  onChange={(e) => setVilleAffectee(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="error-text">{error}</p>}

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Envoi…' : 'Créer mon compte'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
