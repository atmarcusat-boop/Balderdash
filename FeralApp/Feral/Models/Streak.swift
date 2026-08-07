import Foundation

/// Derived, not persisted — see `DayStat` for why. Recomputed from `Session`
/// history whenever a session ends or the app returns to the foreground.
struct StreakInfo: Equatable {
    let current: Int
    let longest: Int
    let lastFeralDate: Date?
    let totalFeralDays: Int

    static let zero = StreakInfo(current: 0, longest: 0, lastFeralDate: nil, totalFeralDays: 0)
}
