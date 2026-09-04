import { useState, type ReactNode } from 'react'
import { ClipboardList, Eye, Plus, Radio } from 'lucide-react'
import { useMatchStore } from './hooks/useMatchStore'
import { useMatchDerived } from './hooks/useDerivedMatch'
import { MatchSetupScreen } from './components/setup/MatchSetupScreen'
import { SecondInningsSetup } from './components/setup/SecondInningsSetup'
import { LiveScoringScreen } from './components/scoring/LiveScoringScreen'
import { LiveView } from './components/live/LiveView'
import { SummaryScreen } from './components/summary/SummaryScreen'
import { Modal } from './components/shared/Modal'
import { IconButton, PrimaryButton, SecondaryButton } from './components/shared/Buttons'

function AppHeader({
  live,
  watchMode,
  onToggleWatch,
  showScorecardToggle,
  scorecardOpen,
  onToggleScorecard,
  onRequestNewMatch,
}: {
  live: boolean
  watchMode: boolean
  onToggleWatch: () => void
  showScorecardToggle: boolean
  scorecardOpen: boolean
  onToggleScorecard: () => void
  onRequestNewMatch: () => void
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <img src={`${import.meta.env.BASE_URL}badge.png`} alt="" className="h-7 w-7 rounded-full" />
        <span className="text-base font-black tracking-tight text-[var(--color-ink)]">Quockarr</span>
      </div>
      <div className="flex items-center gap-2">
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
        <IconButton label="New match" onClick={onRequestNewMatch}>
          <Plus size={17} />
        </IconButton>
      </div>
    </header>
  )
}

export default function App() {
  const { match, discardMatch } = useMatchStore()
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
      <AppHeader
        live={isLiveScreen}
        watchMode={watchMode}
        onToggleWatch={() => setWatchMode((v) => !v)}
        showScorecardToggle={isLiveScreen && hasScoringStarted}
        scorecardOpen={scorecardOpen}
        onToggleScorecard={() => setScorecardOpen((v) => !v)}
        onRequestNewMatch={() => setConfirmNewMatch(true)}
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
            This clears the current match completely. There's no way to get it back.
          </p>
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
