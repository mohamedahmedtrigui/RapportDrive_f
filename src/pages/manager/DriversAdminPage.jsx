import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDrivers, createDriver, updateDriver, deleteDriver } from '../../api/drivers'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons'

const emptyForm = { nom: '', telephone: '', ville: '' }

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', driver? }
  const [form, setForm] = useState(emptyForm)
  const [pendingSave, setPendingSave] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const requestId = useRef(0)

  const load = (targetPage = page, q = search) => {
    const id = ++requestId.current
    return listDrivers({ page: targetPage, q: q || undefined })
      .then(({ data }) => {
        if (id !== requestId.current) return // a newer request has since superseded this one
        setDrivers(data.data)
        setMeta(data)
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
    setLoading(true)
    load(1, search)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    setLoading(true)
    load(nextPage, search)
  }

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (driver) => {
    setForm({ nom: driver.nom, telephone: driver.telephone ?? '', ville: driver.ville })
    setModal({ mode: 'edit', driver })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    setPendingSave({
      mode: modal.mode,
      id: modal.driver?.id,
      label: form.nom,
      data: { nom: form.nom, telephone: form.telephone || null, ville: form.ville },
    })
    setModal(null)
  }

  const confirmSave = async () => {
    setBusy(true)
    setError(null)
    try {
      if (pendingSave.mode === 'create') {
        await createDriver(pendingSave.data)
      } else {
        await updateDriver(pendingSave.id, pendingSave.data)
      }
      setPendingSave(null)
      await load()
    } catch {
      setError("Impossible d'enregistrer le chauffeur.")
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteDriver = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteDriver(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch {
      setError('Impossible de supprimer ce chauffeur.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Chauffeurs</h1>
        <button type="button" className="btn" onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Ajouter un chauffeur
        </button>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <div className="field">
          <label>Rechercher par nom</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom du chauffeur…" />
        </div>
        <button type="submit" className="btn secondary">
          Rechercher
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && <Loading />}

      {!loading && drivers.length === 0 && <EmptyState>Aucun chauffeur ne correspond.</EmptyState>}

      {!loading && drivers.length > 0 && (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Score</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <Link to={`/manager/drivers/${driver.id}`}>{driver.nom}</Link>
                  </td>
                  <td>{driver.telephone ?? '—'}</td>
                  <td>{driver.ville || '—'}</td>
                  <td>
                    <span
                      className={`score-pill ${driver.score >= 70 ? 'score-good' : driver.score >= 40 ? 'score-medium' : 'score-bad'}`}
                    >
                      {driver.score}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-btn small"
                        onClick={() => openEdit(driver)}
                        aria-label={`Modifier ${driver.nom}`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn small danger-hover"
                        onClick={() => setPendingDelete(driver)}
                        aria-label={`Supprimer ${driver.nom}`}
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={handlePageChange} />

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Ajouter un chauffeur' : 'Modifier le chauffeur'}
          onClose={() => setModal(null)}
        >
          <form className="stacked" onSubmit={handleFormSubmit}>
            <div className="field">
              <label>Nom</label>
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="field">
              <label>Téléphone</label>
              <input
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Ville</label>
              <input required value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setModal(null)}>
                Annuler
              </button>
              <button type="submit" className="btn">
                {modal.mode === 'create' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingSave && (
        <ConfirmDialog
          title={pendingSave.mode === 'create' ? 'Confirmer la création' : 'Confirmer la modification'}
          message={
            pendingSave.mode === 'create'
              ? `Ajouter le chauffeur « ${pendingSave.label} » ?`
              : `Enregistrer les modifications pour « ${pendingSave.label} » ?`
          }
          confirmLabel="Confirmer"
          busy={busy}
          onConfirm={confirmSave}
          onCancel={() => setPendingSave(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer le chauffeur"
          message={`Supprimer définitivement « ${pendingDelete.nom} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          busy={busy}
          onConfirm={confirmDeleteDriver}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
