import Foundation

enum DurationFormatter {
    /// "3h 41m", "14m", "48s" — used in stats, results, and share cards.
    static func words(_ seconds: Int) -> String {
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60

        if h > 0 {
            return m > 0 ? "\(h)h \(m)m" : "\(h)h"
        } else if m > 0 {
            return "\(m)m"
        } else {
            return "\(s)s"
        }
    }

    /// "01:23:45" / "23:45" — the big mono live counter.
    static func clock(_ seconds: Int) -> String {
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60

        if h > 0 {
            return String(format: "%02d:%02d:%02d", h, m, s)
        } else {
            return String(format: "%02d:%02d", m, s)
        }
    }
}
