import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchEntries, getDashboardStats } from '../../api/entries'
import { topCitedDrivers } from '../../api/drivers'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { AlertIcon, DriverIcon, EyeIcon } from '../../components/icons'

const scoreClass = (score) => (score >= 70 ? 'score-good' : score >= 40 ? 'score-medium' : 'score-bad')

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [topDrivers, setTopDrivers] = useState([])
  const [gravestEntries, setGravestEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      topCitedDrivers(),
      searchEntries({ severite: 'haute', per_page: 5 }),
    ]).then(([statsRes, citedRes, gravestRes]) => {
      setStats(statsRes.data)

      const totals = new Map()
      citedRes.data.forEach((row) => {
        if (!row.driver) return
        const current = totals.get(row.driver.id) ?? { driver: row.driver, total: 0 }
        current.total += row.total
        totals.set(row.driver.id, current)
      })
      setTopDrivers([...totals.values()].sort((a, b) => b.total - a.total).slice(0, 5))

      setGravestEntries(gravestRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Loading />
  }

  const unreadSummaries = stats.unread_summaries

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="value">{stats.total_reports}</div>
          <div className="label">Rapports</div>
        </div>
        <div className="stat-tile">
          <div className="value">{stats.total_entries}</div>
          <div className="label">Entrées au total</div>
        </div>
        <div className="stat-tile">
          <div className="value">{stats.analyzed_entries}</div>
          <div className="label">Entrées analysées par l'IA</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-head">
            <DriverIcon width={18} height={18} />
            <h2>Chauffeurs les plus cités</h2>
          </div>
          {topDrivers.length === 0 ? (
            <EmptyState>Aucun chauffeur cité pour le moment.</EmptyState>
          ) : (
            <div className="mini-list">
              {topDrivers.map(({ driver, total }) => (
                <div className="mini-list-row" key={driver.id}>
                  <div className="mini-list-main">
                    <Link to={`/manager/drivers/${driver.id}`} className="mini-list-title">
                      {driver.nom}
                    </Link>
                    <span className="mini-list-sub">
                      {total} réclamation{total > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mini-list-side">
                    <span className={`score-pill ${scoreClass(driver.score)}`}>{driver.score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <AlertIcon width={18} height={18} />
            <h2>Réclamations les plus graves</h2>
          </div>
          {gravestEntries.length === 0 ? (
            <EmptyState>Aucune réclamation de sévérité haute pour le moment.</EmptyState>
          ) : (
            <div className="mini-list">
              {gravestEntries.map((entry) => (
                <div className="mini-list-row" key={entry.id}>
                  <div className="mini-list-main">
                    <Link to={`/manager/reports/${entry.report_id}`} className="mini-list-title">
                      {entry.driver?.nom ?? entry.client_nom ?? entry.course_id}
                    </Link>
                    <span className="mini-list-sub">{entry.description}</span>
                  </div>
                  <div className="mini-list-side">
                    <span className="badge severite-haute">{entry.categorie ?? 'haute'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <EyeIcon width={18} height={18} />
            <h2>Récaps IA à lire</h2>
          </div>
          {unreadSummaries.length === 0 ? (
            <EmptyState>Aucun récap IA en attente de lecture.</EmptyState>
          ) : (
            <div className="mini-list">
              {unreadSummaries.map((report) => (
                <div className="mini-list-row" key={report.id}>
                  <div className="mini-list-main">
                    <Link to={`/manager/reports/${report.id}`} className="mini-list-title">
                      Rapport #{report.id} — {report.titre}
                    </Link>
                    <span className="mini-list-sub">{report.ai_summary}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
