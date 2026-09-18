import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createReport } from '../../api/reports'

export default function NewReportPage() {
  const [titre, setTitre] = useState('')
  const [dateRapport, setDateRapport] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data } = await createReport({ titre, date_rapport: dateRapport })
      navigate(`/dispatcher/reports/${data.id}`)
    } catch {
      setError("Impossible de créer le rapport.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Nouveau rapport</h1>
      <form className="stacked card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="titre">Titre</label>
          <input
            id="titre"
            required
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Tournée du matin, Zone nord…"
          />
        </div>
        <div className="field">
          <label htmlFor="date_rapport">Date</label>
          <input
            id="date_rapport"
            type="date"
            required
            value={dateRapport}
            onChange={(e) => setDateRapport(e.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Création…' : 'Créer le rapport'}
        </button>
      </form>
    </div>
  )
}
