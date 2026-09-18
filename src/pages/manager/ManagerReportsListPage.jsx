import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReports, updateReport, deleteReport } from '../../api/reports'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import { EyeIcon, EditIcon, TrashIcon, AlertIcon } from '../../components/icons'

export default function ManagerReportsListPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [titre, setTitre] = useState('')
  const [date, setDate] = useState('')

  const [modal, setModal] = useState(null) // { report }
  const [form, setForm] = useState({ titre: '', date_rapport: '' })
  const [pendingSave, setPendingSave] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const requestId = useRef(0)

  const load = (params, targetPage = 1) => {
    const id = ++requestId.current
    listReports({ ...params, page: targetPage })
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
    load({}, 1)
  }, [])

  const currentFilters = () => ({ titre: titre || undefined, date: date || undefined })

  const handleFilter = (event) => {
    event.preventDefault()
    setPage(1)
    setLoading(true)
    load(currentFilters(), 1)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    setLoading(true)
    load(currentFilters(), nextPage)
  }

  const openEdit = (report) => {
    setForm({ titre: report.titre, date_rapport: report.date_rapport?.slice(0, 10) ?? '' })
    setModal({ report })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    setPendingSave({ id: modal.report.id, label: modal.report.titre, data: form })
    setModal(null)
  }

  const confirmSave = async () => {
    setBusy(true)
    setError(null)
    try {
      await updateReport(pendingSave.id, pendingSave.data)
      setPendingSave(null)
      load(currentFilters(), page)
    } catch {
      setError('Impossible de modifier ce rapport.')
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteReport = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteReport(pendingDelete.id)
      setPendingDelete(null)
      load(currentFilters(), page)
    } catch {
      setError('Impossible de supprimer ce rapport.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Rapports</h1>
      </div>

      <form className="filters" onSubmit={handleFilter}>
        <div className="field">
          <label>Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button type="submit" className="btn">
          Filtrer
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && <Loading />}

      {!loading && reports.length === 0 && (
        <EmptyState>Aucun rapport ne correspond à ces critères.</EmptyState>
      )}

      {!loading && reports.length > 0 && (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Date</th>
                <th>Dispatcher</th>
                <th>État</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const hasUnreadAlert = report.ai_summary && !report.ai_summary_read_at
                return (
                  <tr key={report.id}>
                    <td>
                      <span className="report-id-cell">
                        #{report.id}
                        {hasUnreadAlert && (
                          <span
                            className="alert-dot"
                            title="Récap IA important non lu"
                            aria-label="Récap IA important non lu"
                          >
                            <AlertIcon width={14} height={14} />
                          </span>
                        )}
                      </span>
                    </td>
                    <td>{report.titre}</td>
                    <td>{report.date_rapport?.slice(0, 10)}</td>
                    <td>{report.dispatcher?.nom ?? '—'}</td>
                    <td>
                      {report.submitted_at ? (
                        <span className="badge statut-traite">Terminé</span>
                      ) : (
                        <span className="badge statut-en_attente">En cours de rédaction</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge statut-${report.statut}`}>{report.statut}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-btn small"
                          onClick={() => navigate(`/manager/reports/${report.id}`)}
                          aria-label={`Voir le rapport ${report.titre}`}
                        >
                          <EyeIcon width={16} height={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn small"
                          onClick={() => openEdit(report)}
                          aria-label={`Modifier le rapport ${report.titre}`}
                        >
                          <EditIcon width={16} height={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn small danger-hover"
                          onClick={() => setPendingDelete(report)}
                          aria-label={`Supprimer le rapport ${report.titre}`}
                        >
                          <TrashIcon width={16} height={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={handlePageChange} />

      {modal && (
        <Modal title="Modifier le rapport" onClose={() => setModal(null)}>
          <form className="stacked" onSubmit={handleFormSubmit}>
            <div className="field">
              <label>Titre</label>
              <input
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                required
                value={form.date_rapport}
                onChange={(e) => setForm({ ...form, date_rapport: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setModal(null)}>
                Annuler
              </button>
              <button type="submit" className="btn">
                Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingSave && (
        <ConfirmDialog
          title="Confirmer la modification"
          message={`Enregistrer les modifications pour le rapport « ${pendingSave.label} » ?`}
          busy={busy}
          onConfirm={confirmSave}
          onCancel={() => setPendingSave(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer le rapport"
          message={`Supprimer définitivement le rapport « ${pendingDelete.titre} » du ${pendingDelete.date_rapport?.slice(0, 10)} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          busy={busy}
          onConfirm={confirmDeleteReport}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
