import Foundation
import SwiftData

/// Pure functions over `Session` history. Everything here is recomputed on
/// demand — see the note on `DayStat`/`StreakInfo` for why nothing is cached.
enum StatsCalculator {
    static func countedSessions(in context: ModelContext) -> [Session] {
        let descriptor = FetchDescriptor<Session>(
            predicate: #Predicate { $0.counted == true },
            sortBy: [SortDescriptor(\.startedAt, order: .forward)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    static func totalFeralSec(in context: ModelContext) -> Int {
        countedSessions(in: context).reduce(0) { $0 + $1.durationSec }
    }

    static func longestSessionSec(in context: ModelContext) -> Int {
        countedSessions(in: context).map(\.durationSec).max() ?? 0
    }

    static func totalSecToday(in context: ModelContext, calendar: Calendar = .feral, now: Date = Date()) -> Int {
        let startOfToday = calendar.startOfDay(for: now)
        return countedSessions(in: context)
            .filter { $0.startedAt >= startOfToday }
            .reduce(0) { $0 + $1.durationSec }
    }

    /// Last `days` calendar days, oldest first, including today.
    static func dayStats(in context: ModelContext, days: Int = 7, calendar: Calendar = .feral, now: Date = Date()) -> [DayStat] {
        let sessions = countedSessions(in: context)
        let startOfToday = calendar.startOfDay(for: now)
        let byDay = Dictionary(grouping: sessions) { calendar.startOfDay(for: $0.startedAt) }

        return (0..<days).reversed().compactMap { offset -> DayStat? in
            guard let day = calendar.date(byAdding: .day, value: -offset, to: startOfToday) else { return nil }
            let daySessions = byDay[day] ?? []
            return DayStat(
                date: day,
                totalSec: daySessions.reduce(0) { $0 + $1.durationSec },
                sessionCount: daySessions.count,
                longestSec: daySessions.map(\.durationSec).max() ?? 0
            )
        }
    }

    /// Consecutive-day streak logic: a day "counts" once its total counted
    /// feral time reaches `AppSettings.shared.streakThresholdSec`. Current
    /// streak allows today to still be in progress (an unfinished today
    /// doesn't break the streak until the day actually ends short).
    static func streak(in context: ModelContext, calendar: Calendar = .feral, now: Date = Date()) -> StreakInfo {
        let sessions = countedSessions(in: context)
        guard !sessions.isEmpty else { return .zero }

        let threshold = AppSettings.shared.streakThresholdSec
        let byDay = Dictionary(grouping: sessions) { calendar.startOfDay(for: $0.startedAt) }
        let feralDays = Set(byDay.compactMap { day, daySessions -> Date? in
            daySessions.reduce(0, { $0 + $1.durationSec }) >= threshold ? day : nil
        })
        guard !feralDays.isEmpty else { return .zero }

        let lastFeralDate = feralDays.max()

        // Current streak: walk backward from today (or yesterday, if today hasn't hit threshold yet).
        let startOfToday = calendar.startOfDay(for: now)
        var cursor = feralDays.contains(startOfToday)
            ? startOfToday
            : (calendar.date(byAdding: .day, value: -1, to: startOfToday) ?? startOfToday)
        var current = 0
        while feralDays.contains(cursor) {
            current += 1
            guard let previous = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = previous
        }

        // Longest streak: scan every run of consecutive feral days.
        let sortedDays = feralDays.sorted()
        var longest = 0
        var run = 0
        var previousDay: Date?
        for day in sortedDays {
            if let previousDay,
               calendar.date(byAdding: .day, value: 1, to: previousDay) == day {
                run += 1
            } else {
                run = 1
            }
            longest = max(longest, run)
            previousDay = day
        }

        return StreakInfo(
            current: current,
            longest: max(longest, current),
            lastFeralDate: lastFeralDate,
            totalFeralDays: feralDays.count
        )
    }
}
