// Small, honest pattern-spotting over recent check-ins. Deliberately shallow:
// a plain average per item over the last WINDOW_DAYS, split in half to
// notice a shift. Nothing is surfaced unless there's enough data to back
// it up — no percentages, no manufactured trends out of noise.

import { ITEMS, SECTIONS } from '../data/items'
import { addDays, dateKey } from './date'
import { weight } from './answers'

const WINDOW_DAYS = 30
const MIN_ENTRIES = 6
const MIN_HALF_ENTRIES = 3
const TREND_THRESHOLD = 0.3
const SPREAD_THRESHOLD = 0.12
const TIER_STRONG = 0.7
const TIER_STEADY = 0.4

function average(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function recentDateKeys(days) {
  const today = new Date()
  const keys = []
  for (let i = 0; i < days; i += 1) {
    keys.push(dateKey(addDays(today, -i)))
  }
  return keys
}

function perItemStats(checkins, windowDays) {
  const keys = recentDateKeys(windowDays)
  const half = Math.floor(windowDays / 2)

  return ITEMS.map((item) => {
    const entries = []
    keys.forEach((key, idx) => {
      const value = checkins[key]?.[item.id]
      if (value !== undefined) entries.push({ idx, w: weight(value) })
    })

    const recent = entries.filter((e) => e.idx < half)
    const earlier = entries.filter((e) => e.idx >= half)
    const recentAvg = recent.length >= MIN_HALF_ENTRIES ? average(recent.map((e) => e.w)) : null
    const earlierAvg = earlier.length >= MIN_HALF_ENTRIES ? average(earlier.map((e) => e.w)) : null

    return {
      item,
      count: entries.length,
      overall: entries.length ? average(entries.map((e) => e.w)) : null,
      delta: recentAvg != null && earlierAvg != null ? recentAvg - earlierAvg : null,
    }
  })
}

export function buildInsights(checkins, windowDays = WINDOW_DAYS) {
  const perItem = perItemStats(checkins, windowDays)
  const qualifying = perItem.filter((p) => p.count >= MIN_ENTRIES && p.overall != null)

  if (qualifying.length === 0) {
    return { ready: false, lines: [] }
  }

  const best = qualifying.reduce((a, b) => (b.overall > a.overall ? b : a))
  const weakest = qualifying.reduce((a, b) => (b.overall < a.overall ? b : a))

  const lines = []
  const usedIds = new Set()

  lines.push({ type: 'good', item: best.item })
  usedIds.add(best.item.id)

  if (weakest.item.id !== best.item.id && best.overall - weakest.overall >= SPREAD_THRESHOLD) {
    lines.push({ type: 'attention', item: weakest.item })
    usedIds.add(weakest.item.id)
  }

  const trend = qualifying
    .filter((p) => !usedIds.has(p.item.id) && p.delta != null && Math.abs(p.delta) >= TREND_THRESHOLD)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0]

  if (trend) {
    lines.push({ type: trend.delta > 0 ? 'trend-up' : 'trend-down', item: trend.item })
  }

  return { ready: true, lines }
}

function tierFor(overall) {
  if (overall >= TIER_STRONG) return 'strong'
  if (overall >= TIER_STEADY) return 'steady'
  return 'attention'
}

// A fuller pass for the detail sheet: every item bucketed into a plain
// tier (rather than a top-3 highlight reel), plus one rollup line per
// section. Still no raw numbers — just which of four calm buckets an
// item currently sits in.
export function buildFullBreakdown(checkins, windowDays = WINDOW_DAYS) {
  const perItem = perItemStats(checkins, windowDays)

  const tiers = { strong: [], steady: [], attention: [], noData: [] }
  perItem.forEach((p) => {
    if (p.count < MIN_ENTRIES || p.overall == null) {
      tiers.noData.push(p.item)
    } else {
      tiers[tierFor(p.overall)].push(p.item)
    }
  })

  const sections = SECTIONS.map((section) => {
    const sectionStats = perItem.filter(
      (p) => p.item.section === section.id && p.count >= MIN_ENTRIES && p.overall != null,
    )
    if (sectionStats.length === 0) {
      return { section, tier: 'noData' }
    }
    return { section, tier: tierFor(average(sectionStats.map((p) => p.overall))) }
  })

  const anyData = perItem.some((p) => p.count >= MIN_ENTRIES && p.overall != null)

  return { ready: anyData, tiers, sections }
}
