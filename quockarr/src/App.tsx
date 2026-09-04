import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, ClipboardList, Download, Eye, Plus, Radio } from 'lucide-react'
import { useMatchStore } from './hooks/useMatchStore'
import { useMatchDerived } from './hooks/useDerivedMatch'
import { exportMatchJson, downloadTextFile, matchFilename } from './engine/serialization'
import { MatchSetupScreen } from './components/setup/MatchSetupScreen'
import { SecondInningsSetup } from './components/setup/SecondInningsSetup'
import { LiveScoringScreen } from './components/scoring/LiveScoringScreen'
import { LiveView } from './components/live/LiveView'
import { SummaryScreen } from './components/summary/SummaryScreen'
import { Modal } from './components/shared/Modal'
import { IconButton, PrimaryButton, SecondaryButton } from './components/shared/Buttons'
import type { Match } from './engine/types'

function SaveStatus({ lastSavedAt, saveFailed }: { lastSavedAt: number | null; saveFailed: boolean }) {
  const [, forceTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  if (saveFailed) return null // the banner below covers this case with more room to explain
  if (!lastSavedAt) return null

  const secondsAgo = Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000))
  const label = secondsAgo < 3 ? 'Saved on this device' : `Saved ${secondsAgo}s ago`

  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)]" title={label}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  )
}

function AppHeader({
  live,
  watchMode,
  onToggleWatch,
  showScorecardToggle,
  scorecardOpen,
  onToggleScorecard,
  onRequestNewMatch,
  onExport,
  showExport,
  lastSavedAt,
  saveFailed,
}: {
  live: boolean
  watchMode: boolean
  onToggleWatch: () => void
  showScorecardToggle: boolean
  scorecardOpen: boolean
  onToggleScorecard: () => void
  onRequestNewMatch: () => void
  onExport: () => void
  showExport: boolean
  lastSavedAt: number | null
  saveFailed: boolean
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <img src={`${import.meta.env.BASE_URL}badge.png`} alt="" className="h-7 w-7 rounded-full" />
        <span className="text-base font-black tracking-tight text-[var(--color-ink)]">Quockarr</span>
      </div>
      <div className="flex items-center gap-2">
        <SaveStatus lastSavedAt={lastSavedAt} saveFailed={saveFailed} />
        {live && (
          <IconButton
            label={watchMode ? 'Switch to scoring' : 'Switch to live view'}
            onClick={onToggleWatch}
            className={watchMode ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : ''}
          >
            <Eye size={17} />
          </IconButton>
        )}
        {showScorecardToggle && (
          <IconButton
            label="Scorecard"
            onClick={onToggleScorecard}
            className={scorecardOpen ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : ''}
          >
            <ClipboardList size={17} />
          </IconButton>
        )}
        {showExport && (
          <IconButton label="Download backup" onClick={onExport}>
            <Download size={17} />
          </IconButton>
        )}
        <IconButton label="New match" onClick={onRequestNewMatch}>
          <Plus size={17} />
        </IconButton>
      </div>
    </header>
  )
}

function exportBackup(match: Match) {
  downloadTextFile(matchFilename(match, 'json'), exportMatchJson(match), 'application/json')
}

export default function App() {
  const { match, discardMatch, lastSavedAt, saveFailed } = useMatchStore()
  const derived = useMatchDerived(match)
  const [watchMode, setWatchMode] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [confirmNewMatch, setConfirmNewMatch] = useState(false)

  if (!match) {
    return <MatchSetupScreen />
  }

  const idx = match.currentInningsIndex
  const innings = idx === 0 ? derived.firstInnings : derived.secondInnings

  let body: ReactNode
  let isLiveScreen = false

  if (!innings) {
    body = <MatchSetupScreen />
  } else if (innings.isComplete && idx === 0) {
    body = <SecondInningsSetup match={match} />
  } else if (innings.isComplete && idx === 1) {
    body = <SummaryScreen match={match} />
  } else {
    isLiveScreen = true
    body = watchMode ? <LiveView match={match} /> : <LiveScoringScreen match={match} />
  }

  const hasScoringStarted = match.innings[0]?.balls.length > 0 || idx > 0

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      {saveFailed && (
        <div className="flex items-center gap-2 bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white">
          <AlertTriangle size={16} className="shrink-0" />
          Not saving to this device (storage blocked or full). Download a backup after every over —
          don't refresh until you have.
        </div>
      )}
      <AppHeader
        live={isLiveScreen}
        watchMode={watchMode}
        onToggleWatch={() => setWatchMode((v) => !v)}
        showScorecardToggle={isLiveScreen && hasScoringStarted}
        scorecardOpen={scorecardOpen}
        onToggleScorecard={() => setScorecardOpen((v) => !v)}
        onRequestNewMatch={() => setConfirmNewMatch(true)}
        onExport={() => exportBackup(match)}
        showExport={hasScoringStarted}
        lastSavedAt={lastSavedAt}
        saveFailed={saveFailed}
      />
      {scorecardOpen && isLiveScreen ? (
        <div className="relative">
          <SummaryScreen match={match} />
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
            <SecondaryButton onClick={() => setScorecardOpen(false)} className="flex items-center gap-2 px-5 shadow-lg">
              <Radio size={16} /> Back to live
            </SecondaryButton>
          </div>
        </div>
      ) : (
        body
      )}

      <Modal open={confirmNewMatch} onClose={() => setConfirmNewMatch(false)} title="Start a new match?">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--color-ink-dim)]">
            This clears the current match completely. Download a backup first if you want to keep it —
            once discarded, there's no way to get it back.
          </p>
          {hasScoringStarted && (
            <SecondaryButton onClick={() => exportBackup(match)} className="flex items-center justify-center gap-2">
              <Download size={16} /> Download backup first
            </SecondaryButton>
          )}
          <PrimaryButton
            className="bg-[var(--color-danger)] text-white"
            onClick={() => {
              discardMatch()
              setConfirmNewMatch(false)
              setWatchMode(false)
              setScorecardOpen(false)
            }}
          >
            Discard and start new match
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  )
}
