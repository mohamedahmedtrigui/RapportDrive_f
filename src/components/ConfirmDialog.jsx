import Modal from './Modal'

export default function ConfirmDialog({
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onCancel} disabled={busy}>
          Annuler
        </button>
        <button
          type="button"
          className={`btn${danger ? ' danger' : ''}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Veuillez patienter…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
