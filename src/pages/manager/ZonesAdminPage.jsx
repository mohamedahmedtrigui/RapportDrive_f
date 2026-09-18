import { useEffect, useRef, useState } from 'react'
import { listZones, createZone, updateZone, deleteZone } from '../../api/zones'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons'

const emptyForm = { nom: '' }

export default function ZonesAdminPage() {
  const [zones, setZones] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', zone? }
  const [form, setForm] = useState(emptyForm)
  const [pendingSave, setPendingSave] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const requestId = useRef(0)

  const load = (targetPage = page, q = search) => {
    const id = ++requestId.current
    return listZones({ page: targetPage, q: q || undefined })
      .then(({ data }) => {
        if (id !== requestId.current) return
        setZones(data.data)
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

  const openEdit = (zone) => {
    setForm({ nom: zone.nom })
    setModal({ mode: 'edit', zone })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    setPendingSave({
      mode: modal.mode,
      id: modal.zone?.id,
      label: form.nom,
      data: { nom: form.nom },
    })
    setModal(null)
  }

  const confirmSave = async () => {
    setBusy(true)
    setError(null)
    try {
      if (pendingSave.mode === 'create') {
        await createZone(pendingSave.data)
      } else {
        await updateZone(pendingSave.id, pendingSave.data)
      }
      setPendingSave(null)
      await load()
    } catch {
      setError('Impossible d’enregistrer la zone.')
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteZone = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteZone(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch {
      setError('Impossible de supprimer cette zone.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Zones</h1>
        <button type="button" className="btn" onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Ajouter une zone
        </button>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <div className="field">
          <label>Rechercher par nom</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom de la zone…" />
        </div>
        <button type="submit" className="btn secondary">
          Rechercher
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && <Loading />}

      {!loading && zones.length === 0 && <EmptyState>Aucune zone ne correspond.</EmptyState>}

      {!loading && zones.length > 0 && (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td>{zone.nom}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-btn small"
                        onClick={() => openEdit(zone)}
                        aria-label={`Modifier ${zone.nom}`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn small danger-hover"
                        onClick={() => setPendingDelete(zone)}
                        aria-label={`Supprimer ${zone.nom}`}
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
          title={modal.mode === 'create' ? 'Ajouter une zone' : 'Modifier la zone'}
          onClose={() => setModal(null)}
        >
          <form className="stacked" onSubmit={handleFormSubmit}>
            <div className="field">
              <label>Nom</label>
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
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
              ? `Ajouter la zone « ${pendingSave.label} » ?`
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
          title="Supprimer la zone"
          message={`Supprimer définitivement « ${pendingDelete.nom} » ? Les entrées qui y font référence perdront cette zone. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          busy={busy}
          onConfirm={confirmDeleteZone}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
