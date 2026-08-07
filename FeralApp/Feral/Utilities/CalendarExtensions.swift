import Foundation

extension Calendar {
    /// Fixed to the user's current calendar/timezone at call time — streaks and
    /// day rollups are always evaluated relative to local midnight.
    static var feral: Calendar {
        var calendar = Calendar.current
        calendar.timeZone = TimeZone.current
        return calendar
    }
}
