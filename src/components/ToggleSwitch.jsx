export default function ToggleSwitch({ on, onLabel = 'Actif', offLabel = 'Inactif', disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className={`toggle-switch${on ? ' on' : ''}`}
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
    >
      <span className="toggle-switch-track" />
      <span className="toggle-switch-label">{on ? onLabel : offLabel}</span>
    </button>
  )
}
