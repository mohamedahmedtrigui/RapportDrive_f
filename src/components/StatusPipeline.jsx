import { ClockIcon, CheckIcon, AlertIcon } from './icons'

const STEPS = [
  { key: 'en_attente', label: 'En attente', Icon: ClockIcon },
  { key: 'traite', label: 'Traité', Icon: CheckIcon },
]

export default function StatusPipeline({ status, onChange, disabled }) {
  const activeIndex = STEPS.findIndex((step) => step.key === status)
  const isError = status === 'erreur'

  return (
    <div className="status-pipeline">
      <div className="status-pipeline-track">
        {STEPS.map(({ key, label, Icon }, index) => {
          const isActive = !isError && key === status
          const isDone = !isError && activeIndex > index

          return (
            <div className="status-pipeline-step-wrap" key={key}>
              <button
                type="button"
                className={`status-pipeline-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                onClick={() => onChange(key)}
                disabled={disabled}
              >
                <Icon
                  width={16}
                  height={16}
                  className={isActive && key === 'en_attente' ? 'icon-pulse' : isActive ? 'icon-draw' : ''}
                />
                <span>{label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <span className={`status-pipeline-connector${isDone ? ' filled' : ''}`} />
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className={`status-pipeline-error${isError ? ' active' : ''}`}
        onClick={() => onChange('erreur')}
        disabled={disabled}
      >
        <AlertIcon width={16} height={16} className={isError ? 'icon-shake' : ''} />
        <span>Erreur</span>
      </button>
    </div>
  )
}
