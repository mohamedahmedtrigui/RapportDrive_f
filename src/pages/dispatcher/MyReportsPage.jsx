import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listReports } from '../../api/reports'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'

export default function MyReportsPage() {
  const [reports, setReports] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const fetchPage = (page = 1) => {
    const id = ++requestId.current
    listReports({ page })
      .then(({ data }) => {
        if (id !== requestId.current) return
        setReports(data.data)
        setMeta(data)
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }

  useEffect(() => {
    fetchPage(1)
  }, [])

  const handlePageChange = (page) => {
    setLoading(true)
    fetchPage(page)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mes rapports</h1>
        <Link to="/dispatcher/reports/new" className="btn">
          Nouveau rapport
        </Link>
      </div>

      {loading && <Loading />}

      {!loading && reports.length === 0 && (
        <EmptyState>Aucun rapport pour le moment. Crée ton premier rapport.</EmptyState>
      )}

      {reports.map((report) => (
        <Link key={report.id} to={`/dispatcher/reports/${report.id}`} className="list-item-link">
          <span>
            <strong>{report.titre}</strong> — {report.date_rapport?.slice(0, 10)}
          </span>
          <span className={`badge statut-${report.statut}`}>{report.statut}</span>
        </Link>
      ))}

      <Pagination meta={meta} onPageChange={handlePageChange} />
    </div>
  )
}
