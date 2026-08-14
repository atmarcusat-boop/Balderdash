import { LayoutGrid, Settings as SettingsIcon, Sun } from 'lucide-react'

export default function BottomNav({ screen, onChange, onOpenSettings }) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`nav-btn tap-target${screen === 'today' ? ' active' : ''}`}
        onClick={() => onChange('today')}
      >
        <Sun size={18} strokeWidth={2.25} />
        Today
      </button>
      <button
        type="button"
        className={`nav-btn tap-target${screen === 'progress' ? ' active' : ''}`}
        onClick={() => onChange('progress')}
      >
        <LayoutGrid size={18} strokeWidth={2.25} />
        Progress
      </button>
      <button
        type="button"
        className="nav-btn nav-btn-settings tap-target"
        aria-label="Settings"
        onClick={onOpenSettings}
      >
        <SettingsIcon size={18} strokeWidth={2.25} />
      </button>
    </nav>
  )
}
