import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDriver } from '../../api/drivers'
import { searchEntries } from '../../api/entries'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'

function scoreClass(score) {
  if (score >= 70) return 'score-good'
  if (score >= 40) return 'score-medium'
  return 'score-bad'
}

export default function DriverDetailPage() {
  const { id } = useParams()
  const [driver, setDriver] = useState(null)
  const [entries, setEntries] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadEntries = (page = 1) =>
    searchEntries({ driver_id: id, page }).then(({ data }) => {
      setEntries(data.data)
      setMeta(data)
    })

  useEffect(() => {
    Promise.all([getDriver(id), loadEntries(1)])
      .then(([driverRes]) => setDriver(driverRes.data))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handlePageChange = (page) => {
    setLoading(true)
    loadEntries(page).finally(() => setLoading(false))
  }

  if (loading && !driver) {
    return <Loading />
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{driver?.nom ?? `Chauffeur #${id}`}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {driver?.ville} · {meta?.total ?? 0} entrée(s) le concernant
          </p>
        </div>
        <Link to="/manager/drivers" className="btn secondary">
          Retour aux chauffeurs
        </Link>
      </div>

      {driver && (
        <div className="card">
          <div className="driver-score-row">
            <div>
              <div className="label">Score de fiabilité</div>
              <div className={`score-value ${scoreClass(driver.score)}`}>{driver.score}/100</div>
            </div>
          </div>
          {driver.ai_notes && (
            <>
              <h3 style={{ marginTop: 16 }}>Notes IA récentes</h3>
              <ul className="ai-notes-list">
                {driver.ai_notes.split('\n').map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState>Aucune entrée pour ce chauffeur.</EmptyState>
      ) : (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>Rapport</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Sévérité</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Link to={`/manager/reports/${entry.report_id}`}>#{entry.report_id}</Link>
                  </td>
                  <td>{entry.description}</td>
                  <td>{entry.categorie ?? '—'}</td>
                  <td>
                    {entry.severite ? (
                      <span className={`badge severite-${entry.severite}`}>{entry.severite}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={handlePageChange} />
    </div>
  )
}
