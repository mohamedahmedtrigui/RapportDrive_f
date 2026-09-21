import { SparkleIcon, CheckIcon, ErrorCircleIcon } from './icons'

const CONFIG = {
  en_cours: {
    Icon: SparkleIcon,
    className: 'ia-status-icon en_cours icon-spin-slow',
    label: "Analyse IA en cours…",
  },
  termine: {
    Icon: CheckIcon,
    className: 'ia-status-icon termine',
    label: 'Analyse IA terminée',
  },
  erreur: {
    Icon: ErrorCircleIcon,
    className: 'ia-status-icon erreur',
    label: "Échec de l'analyse IA — vérifiez le service IA",
  },
}

export default function IaStatusIcon({ status }) {
  const config = CONFIG[status]

  if (!config) {
    return null
  }

  const { Icon, className, label } = config

  return (
    <span className={className} title={label} aria-label={label}>
      <Icon width={15} height={15} />
    </span>
  )
}
