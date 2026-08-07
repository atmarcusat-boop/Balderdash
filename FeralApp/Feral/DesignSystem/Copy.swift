import Foundation

/// All the deadpan microcopy in one place, scaled by session length where it matters.
enum Copy {
    static let idleSublines = [
        "Put it down. See how long you last.",
        "You won't make it 20 minutes.",
        "Prove it.",
        "The phone is not going anywhere. Neither is your streak.",
        "Feral is a state of mind. Also a timer.",
        "Nobody's texting you anything that can't wait."
    ]

    static func randomIdleSubline() -> String {
        idleSublines.randomElement() ?? idleSublines[0]
    }

    static let activeSessionLine = "You're feral. Don't ruin it."

    /// Session result verdict, scaled to how long they lasted.
    static func verdict(durationSec: Int, counted: Bool) -> String {
        guard counted else { return "Doesn't count." }

        switch durationSec {
        case ..<600: // < 10m
            return "Barely feral."
        case ..<1800: // < 30m
            return "Decent."
        case ..<3600: // < 1h
            return "Solid."
        case ..<7200: // < 2h
            return "Impressive. Slightly concerning."
        default:
            return "Genuinely feral."
        }
    }

    static func cavedMessage(durationSec: Int, counted: Bool) -> String {
        let duration = DurationFormatter.words(durationSec)
        guard counted else {
            return "You caved at \(duration). Didn't even count."
        }
        return "You caved at \(duration). Weak."
    }

    static func shareLine(durationSec: Int) -> String {
        "I went feral for \(DurationFormatter.words(durationSec)) today \u{1F43A}"
    }
}
