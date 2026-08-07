import UserNotifications

/// Thin wrapper around `UNUserNotificationCenter`. Milestone notifications are
/// scheduled with time-interval triggers relative to the lock timestamp, so
/// they fire on their own even though the app is suspended — no background
/// execution is needed, which is the whole point of using local notifications
/// here instead of a running timer.
final class NotificationManager {
    static let shared = NotificationManager()

    private let center = UNUserNotificationCenter.current()
    private let milestoneCategory = "feral.milestone"
    private let cavedCategory = "feral.caved"

    /// Offset in seconds -> escalating praise.
    private let milestones: [(offset: TimeInterval, body: String)] = [
        (30 * 60, "30 minutes feral. The phone forgot you exist."),
        (60 * 60, "1 hour feral. Respect."),
        (2 * 60 * 60, "2 hours feral. Genuinely unwell. Keep going."),
        (4 * 60 * 60, "4 hours feral. Certified wolf.")
    ]

    private init() {}

    func requestAuthorizationIfNeeded() {
        guard AppSettings.shared.notificationsEnabled else { return }
        center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    func scheduleMilestones(from lockedAt: Date) {
        guard AppSettings.shared.notificationsEnabled else { return }
        let elapsedSinceLock = Date().timeIntervalSince(lockedAt)

        for milestone in milestones {
            let remaining = milestone.offset - elapsedSinceLock
            guard remaining > 0 else { continue }

            let content = UNMutableNotificationContent()
            content.title = "Feral"
            content.body = milestone.body
            content.sound = .default
            content.categoryIdentifier = milestoneCategory

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: remaining, repeats: false)
            let request = UNNotificationRequest(
                identifier: "\(milestoneCategory).\(Int(milestone.offset))",
                content: content,
                trigger: trigger
            )
            center.add(request)
        }
    }

    func cancelMilestones() {
        let identifiers = milestones.map { "\(milestoneCategory).\(Int($0.offset))" }
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
    }

    func sendCavedNotification(durationSec: Int, counted: Bool) {
        guard AppSettings.shared.notificationsEnabled else { return }

        let content = UNMutableNotificationContent()
        content.title = "Feral"
        content.body = Copy.cavedMessage(durationSec: durationSec, counted: counted)
        content.sound = .default
        content.categoryIdentifier = cavedCategory

        let request = UNNotificationRequest(identifier: cavedCategory, content: content, trigger: nil)
        center.add(request)
    }
}
