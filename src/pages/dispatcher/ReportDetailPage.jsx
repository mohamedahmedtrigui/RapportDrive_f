import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReport, analyzeReport } from '../../api/reports'
import { addEntry, updateEntry, deleteEntry } from '../../api/entries'
import { listDrivers } from '../../api/drivers'
import { listZones } from '../../api/zones'
import Loading from '../../components/Loading'
import ReportDocument from '../../components/ReportDocument'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'

const emptyEntryForm = { course_id: '', driver_nom: '', client_nom: '', zone_id: '', description: '' }

export default function ReportDetailPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [zones, setZones] = useState([])
  const [error, setError] = useState(null)

  const [entryForm, setEntryForm] = useState(emptyEntryForm)
  const [submitting, setSubmitting] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)

  const [editModal, setEditModal] = useState(null) // { entry }
  const [editForm, setEditForm] = useState(emptyEntryForm)
  const [pendingEdit, setPendingEdit] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadReport = () => getReport(id).then(({ data }) => setReport(data))

  useEffect(() => {
    loadReport()
    listDrivers().then(({ data }) => setDrivers(data))
    listZones().then(({ data }) => setZones(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAddEntry = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const matchedDriver = drivers.find((d) => d.nom === entryForm.driver_nom)

    try {
      const { data } = await addEntry(id, {
        course_id: entryForm.course_id,
        driver_id: matchedDriver?.id ?? null,
        client_nom: entryForm.client_nom || null,
        zone_id: entryForm.zone_id || null,
        description: entryForm.description,
      })
      setEntryForm(emptyEntryForm)
      setReport((r) => ({ ...r, report_entries: [...r.report_entries, data] }))
    } catch {
      setError("Impossible d'ajouter l'entrée.")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditEntry = (entry) => {
    setEditForm({
      course_id: entry.course_id,
      driver_nom: entry.driver?.nom ?? '',
      client_nom: entry.client_nom ?? '',
      zone_id: entry.zone?.id ?? '',
      description: entry.description,
    })
    setEditModal({ entry })
  }

  const handleEditFormSubmit = (event) => {
    event.preventDefault()
    setPendingEdit({ entry: editModal.entry, data: editForm })
    setEditModal(null)
  }

  const confirmEditEntry = async () => {
    setBusy(true)
    setError(null)
    const matchedDriver = drivers.find((d) => d.nom === pendingEdit.data.driver_nom)

    try {
      const { data } = await updateEntry(id, pendingEdit.entry.id, {
        course_id: pendingEdit.data.course_id,
        driver_id: matchedDriver?.id ?? null,
        client_nom: pendingEdit.data.client_nom || null,
        zone_id: pendingEdit.data.zone_id || null,
        description: pendingEdit.data.description,
      })
      setPendingEdit(null)
      setReport((r) => ({
        ...r,
        report_entries: r.report_entries.map((e) => (e.id === data.id ? data : e)),
      }))
    } catch {
      setError("Impossible de modifier l'entrée.")
    } finally {
      setBusy(false)
    }
  }

  const confirmDeleteEntry = async () => {
    setBusy(true)
    setError(null)
    try {
      await deleteEntry(id, pendingDelete.id)
      const deletedId = pendingDelete.id
      setPendingDelete(null)
      setReport((r) => ({
        ...r,
        report_entries: r.report_entries.filter((e) => e.id !== deletedId),
      }))
    } catch {
      setError("Impossible de supprimer l'entrée.")
    } finally {
      setBusy(false)
    }
  }

  const confirmSubmitReport = async () => {
    setError(null)
    setSubmittingReport(true)
    try {
      const { data } = await analyzeReport(id)
      setConfirmingSubmit(false)
      setReport(data)
    } catch (err) {
      setConfirmingSubmit(false)
      setError(err.response?.data?.message ?? "La soumission a échoué. Réessaie dans quelques instants.")
    } finally {
      setSubmittingReport(false)
    }
  }

  if (!report) {
    return <Loading />
  }

  const hasEntries = report.report_entries.length > 0
  const alreadySubmitted = Boolean(report.submitted_at)

  return (
    <div>
      {error && (
        <p className="error-text" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      <ReportDocument
        report={report}
        showAiAnalysis={false}
        onEditEntry={alreadySubmitted ? undefined : openEditEntry}
        onDeleteEntry={alreadySubmitted ? undefined : setPendingDelete}
        actions={
          alreadySubmitted ? (
            <span className="badge statut-traite">Rapport déjà soumis</span>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => setConfirmingSubmit(true)}
              disabled={!hasEntries || submittingReport}
            >
              {submittingReport ? 'Soumission…' : 'Soumettre le rapport'}
            </button>
          )
        }
      />

      {!alreadySubmitted && (
        <div className="card">
          <h2>Ajouter une entrée</h2>
          <form className="stacked" onSubmit={handleAddEntry}>
            <div className="field">
              <label htmlFor="course_id">Course</label>
              <input
                id="course_id"
                required
                value={entryForm.course_id}
                onChange={(e) => setEntryForm({ ...entryForm, course_id: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="driver">Chauffeur</label>
              <input
                id="driver"
                list="drivers-list"
                value={entryForm.driver_nom}
                onChange={(e) => setEntryForm({ ...entryForm, driver_nom: e.target.value })}
                placeholder="Rechercher un chauffeur…"
              />
              <datalist id="drivers-list">
                {drivers.map((d) => (
                  <option key={d.id} value={d.nom} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="client">Client</label>
              <input
                id="client"
                value={entryForm.client_nom}
                onChange={(e) => setEntryForm({ ...entryForm, client_nom: e.target.value })}
                placeholder="Nom du client (si connu)…"
              />
            </div>
            <div className="field">
              <label htmlFor="zone">Zone</label>
              <select
                id="zone"
                value={entryForm.zone_id}
                onChange={(e) => setEntryForm({ ...entryForm, zone_id: e.target.value })}
              >
                <option value="">Sélectionner une zone…</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                required
                value={entryForm.description}
                onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Ajout…' : "Ajouter l'entrée"}
            </button>
          </form>
        </div>
      )}

      {confirmingSubmit && (
        <ConfirmDialog
          title="Soumettre le rapport"
          message="Es-tu sûr d'avoir terminé ton rapport ? Une fois soumis, il ne pourra plus être modifié (ni entrées ajoutées, éditées ou supprimées) et l'analyse IA sera lancée."
          confirmLabel="Oui, soumettre"
          busy={submittingReport}
          onConfirm={confirmSubmitReport}
          onCancel={() => setConfirmingSubmit(false)}
        />
      )}

      {editModal && (
        <Modal title="Modifier l'entrée" onClose={() => setEditModal(null)}>
          <form className="stacked" onSubmit={handleEditFormSubmit}>
            <div className="field">
              <label htmlFor="edit_course_id">Course</label>
              <input
                id="edit_course_id"
                required
                value={editForm.course_id}
                onChange={(e) => setEditForm({ ...editForm, course_id: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="edit_driver">Chauffeur</label>
              <input
                id="edit_driver"
                list="drivers-list"
                value={editForm.driver_nom}
                onChange={(e) => setEditForm({ ...editForm, driver_nom: e.target.value })}
                placeholder="Rechercher un chauffeur…"
              />
            </div>
            <div className="field">
              <label htmlFor="edit_client">Client</label>
              <input
                id="edit_client"
                value={editForm.client_nom}
                onChange={(e) => setEditForm({ ...editForm, client_nom: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="edit_zone">Zone</label>
              <select
                id="edit_zone"
                value={editForm.zone_id}
                onChange={(e) => setEditForm({ ...editForm, zone_id: e.target.value })}
              >
                <option value="">Sélectionner une zone…</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="edit_description">Description</label>
              <textarea
                id="edit_description"
                required
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setEditModal(null)}>
                Annuler
              </button>
              <button type="submit" className="btn">
                Enregistrer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingEdit && (
        <ConfirmDialog
          title="Confirmer la modification"
          message={`Enregistrer les modifications pour l'entrée « ${pendingEdit.entry.course_id} » ?`}
          busy={busy}
          onConfirm={confirmEditEntry}
          onCancel={() => setPendingEdit(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Supprimer l'entrée"
          message={`Supprimer définitivement l'entrée « ${pendingDelete.course_id} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          busy={busy}
          onConfirm={confirmDeleteEntry}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
