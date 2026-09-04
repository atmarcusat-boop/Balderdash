import { Download, FileText } from 'lucide-react'
import type { Match } from '../../engine/types'
import { useMatchDerived } from '../../hooks/useDerivedMatch'
import { downloadTextFile, exportMatchJson, matchFilename, matchToText } from '../../engine/serialization'
import { InningsScorecard } from './InningsScorecard'
import { Card } from '../shared/Card'
import { SecondaryButton } from '../shared/Buttons'

export function SummaryScreen({ match }: { match: Match }) {
  const derived = useMatchDerived(match)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-4 pb-10">
      {derived.result && (
        <Card className="bg-[var(--color-accent-dim)] text-center">
          <p className="text-lg font-bold text-[var(--color-accent)]">{derived.result.text}</p>
        </Card>
      )}
      {!derived.result && derived.firstInnings?.isComplete && !derived.secondInnings && (
        <Card className="text-center">
          <p className="font-semibold text-[var(--color-ink)]">Innings break</p>
          <p className="mt-1 text-sm text-[var(--color-ink-dim)]">
            {derived.firstInnings.battingTeam === 'A' ? match.settings.teamBName : match.settings.teamAName}{' '}
            need {derived.target} to win.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SecondaryButton
          onClick={() => downloadTextFile(matchFilename(match, 'txt'), matchToText(match), 'text/plain')}
          className="flex items-center justify-center gap-2"
        >
          <FileText size={16} /> Scorecard (.txt)
        </SecondaryButton>
        <SecondaryButton
          onClick={() => downloadTextFile(matchFilename(match, 'json'), exportMatchJson(match), 'application/json')}
          className="flex items-center justify-center gap-2"
        >
          <Download size={16} /> Backup (.json)
        </SecondaryButton>
      </div>

      {derived.firstInnings && (
        <InningsScorecard match={match} innings={derived.firstInnings} players={derived.players} inningsNumber={1} />
      )}
      {derived.secondInnings && (
        <InningsScorecard match={match} innings={derived.secondInnings} players={derived.players} inningsNumber={2} />
      )}
    </div>
  )
}
