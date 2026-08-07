import Foundation

/// Derived rollup for a single calendar day. Computed from `Session` records by
/// `StatsCalculator` rather than persisted — the underlying sessions are the
/// source of truth, and the dataset is small enough to recompute cheaply.
struct DayStat: Identifiable, Equatable {
    var id: DateComponents { Calendar.feral.dateComponents([.year, .month, .day], from: date) }
    let date: Date
    let totalSec: Int
    let sessionCount: Int
    let longestSec: Int

    var metThreshold: Bool {
        totalSec >= AppSettings.shared.streakThresholdSec
    }
}
