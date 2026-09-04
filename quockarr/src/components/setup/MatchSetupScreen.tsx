import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import type { Player } from '../../engine/types'
import { useMatchStore } from '../../hooks/useMatchStore'
import { Card, SectionLabel } from '../shared/Card'
import { Chip, IconButton, PrimaryButton, SecondaryButton } from '../shared/Buttons'

const OVERS_PRESETS = [10, 20, 40, 50]

function newPlayer(name: string): Player {
  return { id: crypto.randomUUID(), name: name.trim() }
}

function SquadEditor({
  teamName,
  players,
  onChange,
}: {
  teamName: string
  players: Player[]
  onChange: (players: Player[]) => void
}) {
  const [draft, setDraft] = useState('')

  const add = () => {
    if (!draft.trim()) return
    onChange([...players, newPlayer(draft)])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>{teamName || 'Team'} squad</SectionLabel>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Player name"
          className="min-h-12 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
        />
        <IconButton label="Add player" onClick={add} className="bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)]">
          <Plus size={20} />
        </IconButton>
      </div>
      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3"
          >
            <span className="text-[var(--color-ink)]">
              <span className="mr-2 text-[var(--color-ink-faint)] tabular-nums">{i + 1}</span>
              {p.name}
            </span>
            <button
              aria-label={`Remove ${p.name}`}
              onClick={() => onChange(players.filter((pl) => pl.id !== p.id))}
              className="text-[var(--color-ink-faint)] active:text-[var(--color-danger)]"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
        {players.length === 0 && (
          <li className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-ink-faint)]">
            Add at least two players to get started
          </li>
        )}
      </ul>
    </div>
  )
}

export function MatchSetupScreen() {
  const { newMatch, startInnings } = useMatchStore()

  const [step, setStep] = useState(0)
  const [teamAName, setTeamAName] = useState('Team A')
  const [teamBName, setTeamBName] = useState('Team B')
  const [oversLimit, setOversLimit] = useState(20)
  const [teamA, setTeamA] = useState<Player[]>([])
  const [teamB, setTeamB] = useState<Player[]>([])
  const [tossWonBy, setTossWonBy] = useState<'A' | 'B' | undefined>(undefined)
  const [tossChoice, setTossChoice] = useState<'bat' | 'bowl' | undefined>(undefined)

  const battingFirst: 'A' | 'B' = useMemo(() => {
    if (!tossWonBy || !tossChoice) return 'A'
    if (tossChoice === 'bat') return tossWonBy
    return tossWonBy === 'A' ? 'B' : 'A'
  }, [tossWonBy, tossChoice])

  const battingSquad = battingFirst === 'A' ? teamA : teamB
  const bowlingSquad = battingFirst === 'A' ? teamB : teamA
  const [strikerId, setStrikerId] = useState('')
  const [nonStrikerId, setNonStrikerId] = useState('')
  const [bowlerId, setBowlerId] = useState('')

  const steps = ['Match', teamAName || 'Team A', teamBName || 'Team B', 'Toss', 'Openers']

  const canProceed = [
    teamAName.trim() && teamBName.trim() && oversLimit > 0,
    teamA.length >= 2,
    teamB.length >= 2,
    true,
    strikerId && nonStrikerId && strikerId !== nonStrikerId && bowlerId,
  ]

  const submit = () => {
    newMatch({ teamAName, teamBName, oversLimit, tossWonBy, tossChoice }, teamA, teamB)
    startInnings(battingFirst, strikerId, nonStrikerId, bowlerId)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-col items-center gap-2 pt-4 pb-2 text-center">
        <img
          src={`${import.meta.env.BASE_URL}crest.png`}
          alt=""
          className="h-24 w-24 drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
        />
        <span className="text-2xl font-black tracking-tight text-[var(--color-ink)]">Quockarr</span>
        <p className="text-sm text-[var(--color-ink-dim)]">Set up a new match</p>
      </header>

      <div className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <div
            key={label + i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
            }`}
          />
        ))}
      </div>
      <SectionLabel>{steps[step]}</SectionLabel>

      {step === 0 && (
        <Card className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Team A name</span>
            <input
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="min-h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-base outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Team B name</span>
            <input
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="min-h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-base outline-none focus:border-[var(--color-accent)]"
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Overs per innings</span>
            <div className="flex flex-wrap gap-2">
              {OVERS_PRESETS.map((n) => (
                <Chip key={n} active={oversLimit === n} onClick={() => setOversLimit(n)}>
                  {n}
                </Chip>
              ))}
              <input
                type="number"
                min={1}
                value={oversLimit}
                onChange={(e) => setOversLimit(Number(e.target.value) || 0)}
                className="min-h-11 w-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 text-base tabular-nums outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <SquadEditor teamName={teamAName} players={teamA} onChange={setTeamA} />
        </Card>
      )}

      {step === 2 && (
        <Card>
          <SquadEditor teamName={teamBName} players={teamB} onChange={setTeamB} />
        </Card>
      )}

      {step === 3 && (
        <Card className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Who won the toss?</span>
            <div className="flex gap-2">
              <Chip active={tossWonBy === 'A'} onClick={() => setTossWonBy('A')} className="flex-1">
                {teamAName}
              </Chip>
              <Chip active={tossWonBy === 'B'} onClick={() => setTossWonBy('B')} className="flex-1">
                {teamBName}
              </Chip>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">And chose to</span>
            <div className="flex gap-2">
              <Chip active={tossChoice === 'bat'} onClick={() => setTossChoice('bat')} className="flex-1">
                Bat
              </Chip>
              <Chip active={tossChoice === 'bowl'} onClick={() => setTossChoice('bowl')} className="flex-1">
                Bowl
              </Chip>
            </div>
          </div>
          <p className="text-sm text-[var(--color-ink-faint)]">
            {tossWonBy && tossChoice
              ? `${battingFirst === 'A' ? teamAName : teamBName} will bat first.`
              : 'Toss is optional — skip it and pick who bats first on the next step.'}
          </p>
          {!tossWonBy && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-ink-dim)]">Batting first</span>
              <div className="flex gap-2">
                <Chip active={battingFirst === 'A'} onClick={() => { setTossWonBy('A'); setTossChoice('bat') }} className="flex-1">
                  {teamAName}
                </Chip>
                <Chip active={battingFirst === 'B'} onClick={() => { setTossWonBy('B'); setTossChoice('bat') }} className="flex-1">
                  {teamBName}
                </Chip>
              </div>
            </div>
          )}
        </Card>
      )}

      {step === 4 && (
        <Card className="flex flex-col gap-5">
          <p className="text-sm text-[var(--color-ink-dim)]">
            {battingFirst === 'A' ? teamAName : teamBName} bats first against{' '}
            {battingFirst === 'A' ? teamBName : teamAName}.
          </p>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">On strike</span>
            <div className="flex flex-wrap gap-2">
              {battingSquad.map((p) => (
                <Chip key={p.id} active={strikerId === p.id} onClick={() => setStrikerId(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Non-striker</span>
            <div className="flex flex-wrap gap-2">
              {battingSquad
                .filter((p) => p.id !== strikerId)
                .map((p) => (
                  <Chip key={p.id} active={nonStrikerId === p.id} onClick={() => setNonStrikerId(p.id)}>
                    {p.name}
                  </Chip>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Opening bowler</span>
            <div className="flex flex-wrap gap-2">
              {bowlingSquad.map((p) => (
                <Chip key={p.id} active={bowlerId === p.id} onClick={() => setBowlerId(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-auto flex gap-3 pt-2">
        {step > 0 && (
          <SecondaryButton onClick={() => setStep((s) => s - 1)} className="flex w-auto items-center justify-center px-4">
            <ChevronLeft size={20} />
          </SecondaryButton>
        )}
        {step < steps.length - 1 ? (
          <PrimaryButton disabled={!canProceed[step]} onClick={() => setStep((s) => s + 1)} className="flex items-center justify-center gap-1">
            Next <ChevronRight size={18} />
          </PrimaryButton>
        ) : (
          <PrimaryButton disabled={!canProceed[step]} onClick={submit}>
            Start match
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}
