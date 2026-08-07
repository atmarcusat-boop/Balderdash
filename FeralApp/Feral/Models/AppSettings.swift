import Foundation

/// Small, infrequently-changed config. UserDefaults is a better fit than
/// SwiftData for a handful of scalar knobs with no query/rollup needs.
final class AppSettings {
    static let shared = AppSettings()

    private let defaults: UserDefaults
    private enum Key {
        static let minimumSessionSec = "minimumSessionSec"
        static let streakThresholdSec = "streakThresholdSec"
        static let notificationsEnabled = "notificationsEnabled"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        defaults.register(defaults: [
            Key.minimumSessionSec: 120,
            Key.streakThresholdSec: 1800,
            Key.notificationsEnabled: true
        ])
    }

    /// A session shorter than this doesn't get banked. Default 2 minutes.
    var minimumSessionSec: Int {
        get { defaults.integer(forKey: Key.minimumSessionSec) }
        set { defaults.set(newValue, forKey: Key.minimumSessionSec) }
    }

    /// A day's total counted feral time must reach this to count toward the streak. Default 30 minutes.
    var streakThresholdSec: Int {
        get { defaults.integer(forKey: Key.streakThresholdSec) }
        set { defaults.set(newValue, forKey: Key.streakThresholdSec) }
    }

    var notificationsEnabled: Bool {
        get { defaults.bool(forKey: Key.notificationsEnabled) }
        set { defaults.set(newValue, forKey: Key.notificationsEnabled) }
    }
}
