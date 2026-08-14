export default function BottomNav({ screen, onChange, onOpenSettings }) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`nav-btn tap-target${screen === 'today' ? ' active' : ''}`}
        onClick={() => onChange('today')}
      >
        Today
      </button>
      <button
        type="button"
        className={`nav-btn tap-target${screen === 'progress' ? ' active' : ''}`}
        onClick={() => onChange('progress')}
      >
        Progress
      </button>
      <button
        type="button"
        className="nav-btn nav-btn-settings tap-target"
        aria-label="Settings"
        onClick={onOpenSettings}
      >
        ⋯
      </button>
    </nav>
  )
}
