import type { Match, Player } from '../../engine/types'
import type { InningsState } from '../../engine/matchEngine'
import { economy, oversLabel, strikeRate } from '../../engine/matchEngine'
import { Card, SectionLabel } from '../shared/Card'

export function InningsScorecard({
  match,
  innings,
  players,
  inningsNumber,
}: {
  match: Match
  innings: InningsState
  players: Map<string, Player>
  inningsNumber: 1 | 2
}) {
  const teamName = innings.battingTeam === 'A' ? match.settings.teamAName : match.settings.teamBName

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-bold text-[var(--color-ink)]">
          {inningsNumber === 1 ? '1st' : '2nd'} innings — {teamName}
        </h3>
        <span className="tabular-nums text-[var(--color-ink-dim)]">
          {innings.totalRuns}/{innings.totalWickets} ({oversLabel(innings.legalBallsBowled)} ov)
        </span>
      </div>

      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-3 py-2 font-medium">Batter</th>
              <th className="px-2 py-2 text-right font-medium">R</th>
              <th className="px-2 py-2 text-right font-medium">B</th>
              <th className="px-2 py-2 text-right font-medium">4s</th>
              <th className="px-2 py-2 text-right font-medium">6s</th>
              <th className="px-2 py-2 text-right font-medium">SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.battingOrder.map((id) => {
              const stat = innings.battingPlayers.get(id)!
              return (
                <tr key={id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--color-ink)]">{players.get(id)?.name}</div>
                    <div className="text-xs text-[var(--color-ink-faint)]">
                      {stat.out ? stat.howOut : 'not out'}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right font-bold tabular-nums text-[var(--color-ink)]">{stat.runs}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">{stat.balls}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">{stat.fours}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">{stat.sixes}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">
                    {strikeRate(stat.runs, stat.balls).toFixed(1)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <Card className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-ink-dim)]">
        <span>
          Extras <span className="font-bold tabular-nums text-[var(--color-ink)]">{innings.extras.total}</span>
        </span>
        <span>
          (b {innings.extras.byes}, lb {innings.extras.legbyes}, wd {innings.extras.wides}, nb {innings.extras.noballs})
        </span>
      </Card>

      <SectionLabel>Bowling</SectionLabel>
      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-3 py-2 font-medium">Bowler</th>
              <th className="px-2 py-2 text-right font-medium">O</th>
              <th className="px-2 py-2 text-right font-medium">M</th>
              <th className="px-2 py-2 text-right font-medium">R</th>
              <th className="px-2 py-2 text-right font-medium">W</th>
              <th className="px-2 py-2 text-right font-medium">Econ</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowlingOrder.map((id) => {
              const stat = innings.bowlingFigures.get(id)!
              return (
                <tr key={id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2 font-medium text-[var(--color-ink)]">{players.get(id)?.name}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">
                    {oversLabel(stat.legalBalls)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">{stat.maidens}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">{stat.runsConceded}</td>
                  <td className="px-2 py-2 text-right font-bold tabular-nums text-[var(--color-ink)]">{stat.wickets}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-[var(--color-ink-dim)]">
                    {economy(stat.runsConceded, stat.legalBalls).toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {innings.fallOfWickets.length > 0 && (
        <>
          <SectionLabel>Fall of wickets</SectionLabel>
          <Card className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-[var(--color-ink-dim)]">
            {innings.fallOfWickets.map((fow) => (
              <span key={fow.wicketNumber} className="tabular-nums">
                {fow.wicketNumber}-{fow.runs}{' '}
                <span className="text-[var(--color-ink-faint)]">
                  ({players.get(fow.playerOutId)?.name}, {fow.overLabel} ov)
                </span>
              </span>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}
