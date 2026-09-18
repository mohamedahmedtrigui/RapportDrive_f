import { useEffect, useRef, useState } from 'react'
import {
  listDispatchers,
  createDispatcher,
  updateDispatcher,
  deleteDispatcher,
  setDispatcherApproval,
} from '../../api/dispatchers'
import EmptyState from '../../components/EmptyState'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import ToggleSwitch from '../../components/ToggleSwitch'
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons'

const emptyForm = { nom: '', email: '', ville_affectee: '', password: '' }

export default function DispatchersAdminPage() {
  const [dispatchers, setDispatchers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [modal, setModal] = useState(null) // { mode: 'create' | 'edit', dispatcher? }
  const [form, setForm] = useState(emptyForm)
  const [pendingSave, setPendingSave] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(null) // { dispatcher, nextValue }

  const requestId = useRef(0)

  const load = (targetPage = page, q = search, s = status) => {
    const id = ++requestId.current
    return listDispatchers({ page: targetPage, q: q || undefined, status: s || undefined })
      .then(({ data }) => {
        if (id !== requestId.current) return
        setDispatchers(data.data)
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
    load(1, search, status)
  }

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    setLoading(true)
    load(nextPage, search, status)
  }

  const openCreate = () => {
    setForm(emptyForm)
    setModal({ mode: 'create' })
  }

  const openEdit = (dispatcher) => {
    setForm({
      nom: dispatcher.nom,
      email: dispatcher.email,
      ville_affectee: dispatcher.ville_affectee,
      password: '',
    })
    setModal({ mode: 'edit', dispatcher })
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    const data = {
      nom: form.nom,
      email: form.email,
      ville_affectee: form.ville_affectee,
      ...(form.password ? { password: form.password } : {}),
    }
    setPendingSave({ mode: modal.mode, id: modal.dispatcher?.id, label: form.nom, data })
    setModal(null)
  }

  const confirmSave = async () => {
    setBusy(true)
    setError(null)
    try {
      if (pendingSave.mode === 'create') {
        await createDispatcher({ ...pendingSave.data, password: pendingSave.data.password ?? '' })
      } else {
        await updateDispatcher(pendingSave.id, pendingSave.data)
      }
      setPendingSave(null)
      await load()
    } catch {
      setError('Impossible d’enregistrer le dispatcher (email déjà utilisé ?).')
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteDispatcher = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteDispatcher(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch {
      setError('Impossible de supprimer ce dispatcher.')
    } finally {
      setBusy(false)
    }
  }

  const confirmApprovalChange = async () => {
    setBusy(true)
    setError(null)
    try {
      await setDispatcherApproval(pendingApproval.dispatcher.id, pendingApproval.nextValue)
      setPendingApproval(null)
      await load()
    } catch {
      setError("Impossible de modifier l'accès de ce dispatcher.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dispatchers</h1>
        <button type="button" className="btn" onClick={openCreate}>
          <PlusIcon width={16} height={16} />
          Ajouter un dispatcher
        </button>
      </div>

      <form className="filters" onSubmit={handleSearch}>
        <div className="field">
          <label>Rechercher par nom</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom du dispatcher…" />
        </div>
        <div className="field">
          <label>Statut</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="pending">En attente d'approbation</option>
            <option value="approved">Approuvés</option>
          </select>
        </div>
        <button type="submit" className="btn secondary">
          Rechercher
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading && <Loading />}

      {!loading && dispatchers.length === 0 && <EmptyState>Aucun dispatcher ne correspond.</EmptyState>}

      {!loading && dispatchers.length > 0 && (
        <div className="card no-padding">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Ville affectée</th>
                <th>Accès</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dispatchers.map((dispatcher) => (
                <tr key={dispatcher.id}>
                  <td>{dispatcher.nom}</td>
                  <td>{dispatcher.email}</td>
                  <td>{dispatcher.ville_affectee}</td>
                  <td>
                    <ToggleSwitch
                      on={dispatcher.is_approved}
                      onLabel="Approuvé"
                      offLabel="En attente"
                      ariaLabel={`Accès de ${dispatcher.nom}`}
                      onClick={() =>
                        setPendingApproval({ dispatcher, nextValue: !dispatcher.is_approved })
                      }
                    />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="icon-btn small"
                        onClick={() => openEdit(dispatcher)}
                        aria-label={`Modifier ${dispatcher.nom}`}
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn small danger-hover"
                        onClick={() => setPendingDelete(dispatcher)}
                        aria-label={`Supprimer ${dispatcher.nom}`}
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
          title={modal.mode === 'create' ? 'Ajouter un dispatcher' : 'Modifier le dispatcher'}
          onClose={() => setModal(null)}
        >
          <form className="stacked" onSubmit={handleFormSubmit}>
            <div className="field">
              <label>Nom</label>
              <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Ville affectée</label>
              <input
                required
                value={form.ville_affectee}
                onChange={(e) => setForm({ ...form, ville_affectee: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Mot de passe {modal.mode === 'edit' && '(laisser vide pour ne pas changer)'}</label>
              <input
                type="password"
                required={modal.mode === 'create'}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
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
              ? `Ajouter le dispatcher « ${pendingSave.label} » ?`
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
          title="Supprimer le dispatcher"
          message={`Supprimer définitivement « ${pendingDelete.nom} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          busy={busy}
          onConfirm={confirmDeleteDispatcher}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {pendingApproval && (
        <ConfirmDialog
          title={pendingApproval.nextValue ? 'Approuver le dispatcher' : "Désactiver l'accès"}
          message={
            pendingApproval.nextValue
              ? `Autoriser « ${pendingApproval.dispatcher.nom} » (${pendingApproval.dispatcher.email}) à se connecter à son compte ?`
              : `Désactiver l'accès de « ${pendingApproval.dispatcher.nom} » ? Il ne pourra plus se connecter, et sa session en cours sera immédiatement révoquée.`
          }
          confirmLabel={pendingApproval.nextValue ? 'Approuver' : 'Désactiver'}
          danger={!pendingApproval.nextValue}
          busy={busy}
          onConfirm={confirmApprovalChange}
          onCancel={() => setPendingApproval(null)}
        />
      )}
    </div>
  )
}
