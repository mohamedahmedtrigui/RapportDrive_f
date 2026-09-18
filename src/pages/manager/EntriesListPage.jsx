import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchEntries } from '../../api/entries'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Pagination from '../../components/Pagination'

const emptyFilters = { chauffeur: '', client: '', zone: '', titre: '', categorie: '', severite: '', from: '', to: '' }

export default function EntriesListPage() {
  const [filters, setFilters] = useState(emptyFilters)
  const [entries, setEntries] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = (params, targetPage = 1) => {
    const id = ++requestId.current
    searchEntries({ ...params, page: targetPage })
      .then(({ data }) => {
        if (id !== requestId.current) return
        setEntries(data.data)
        setMeta(data)
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }

  useEffect(() => {
    load({}, 1)
  }, [])

  const activeFilters = () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v))

  const handleFilter = (event) => {
    event.preventDefault()
    setLoading(true)
    load(activeFilters(), 1)
  }

  const handlePageChange = (nextPage) => {
    setLoading(true)
    load(activeFilters(), nextPage)
  }

  const updateFilter = (key) => (event) => setFilters((f) => ({ ...f, [key]: event.target.value }))

  return (
    <div>
      <h1>Entrées</h1>

      <form className="filters" onSubmit={handleFilter}>
        <div className="field">
          <label>Chauffeur</label>
          <input value={filters.chauffeur} onChange={updateFilter('chauffeur')} />
        </div>
        <div className="field">
          <label>Client</label>
          <input value={filters.client} onChange={updateFilter('client')} />
        </div>
        <div className="field">
          <label>Zone</label>
          <input value={filters.zone} onChange={updateFilter('zone')} />
        </div>
        <div className="field">
          <label>Titre du rapport</label>
          <input value={filters.titre} onChange={updateFilter('titre')} />
        </div>
        <div className="field">
          <label>Catégorie</label>
          <input value={filters.categorie} onChange={updateFilter('categorie')} />
        </div>
        <div className="field">
          <label>Sévérité</label>
          <select value={filters.severite} onChange={updateFilter('severite')}>
            <option value="">Toutes</option>
            <option value="faible">faible</option>
            <option value="moyenne">moyenne</option>
            <option value="haute">haute</option>
          </select>
        </div>
        <div className="field">
          <label>Du</label>
          <input type="date" value={filters.from} onChange={updateFilter('from')} />
        </div>
        <div className="field">
          <label>Au</label>
          <input type="date" value={filters.to} onChange={updateFilter('to')} />
        </div>
        <button type="submit" className="btn">
          Filtrer
        </button>
      </form>

      {loading && <Loading />}

      {!loading && entries.length === 0 && (
        <EmptyState>Aucune entrée ne correspond à ces critères.</EmptyState>
      )}

      {!loading && entries.length > 0 && (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>Rapport</th>
                <th>Chauffeur</th>
                <th>Client</th>
                <th>Zone</th>
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
                  <td>
                    {entry.driver ? (
                      <Link to={`/manager/drivers/${entry.driver.id}`}>{entry.driver.nom}</Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{entry.client_nom ?? '—'}</td>
                  <td>{entry.zone?.nom ?? '—'}</td>
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
