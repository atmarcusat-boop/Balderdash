import Foundation
import SwiftData
import Observation

enum SessionPhase: Equatable {
    /// Nothing going on. Home screen.
    case idle
    /// GO FERAL was tapped; waiting for the phone to actually lock.
    case armed(armedAt: Date)
    /// Phone is locked; time is accruing. Screen is off — nobody sees this
    /// state, it just describes what's true.
    case locked(lockedAt: Date)
    /// A session just ended. Show the result screen.
    case result(SessionResult)
}

struct SessionResult: Equatable {
    let startedAt: Date
    let endedAt: Date
    let durationSec: Int
    let counted: Bool
    let endedByUnlock: Bool
}

/// The whole app's state machine. Deliberately timestamp-driven, not
/// timer-driven: iOS suspends background timers, so the only thing we can
/// trust is "what time is it now" compared against a persisted start time.
/// See `LockStateMonitor` for how lock/unlock is actually detected.
@Observable
final class SessionEngine {
    private(set) var phase: SessionPhase = .idle
    private(set) var streak: StreakInfo = .zero
    private(set) var totalFeralSecToday: Int = 0
    private(set) var totalFeralSecAllTime: Int = 0

    let lockMonitor: LockStateMonitor
    private let modelContext: ModelContext
    private let defaults: UserDefaults
    private let minimumSessionSec: () -> Int
    private let clock: () -> Date

    private enum PendingKey {
        static let armedAt = "pendingSession.armedAt"
        static let lockedAt = "pendingSession.lockedAt"
    }

    init(
        modelContext: ModelContext,
        defaults: UserDefaults = .standard,
        lockMonitor: LockStateMonitor = LockStateMonitor(),
        minimumSessionSec: @escaping () -> Int = { AppSettings.shared.minimumSessionSec },
        clock: @escaping () -> Date = Date.init
    ) {
        self.modelContext = modelContext
        self.defaults = defaults
        self.lockMonitor = lockMonitor
        self.minimumSessionSec = minimumSessionSec
        self.clock = clock

        lockMonitor.onLock = { [weak self] in self?.handleLockDetected() }
        lockMonitor.onUnlock = { [weak self] in self?.handleReturnToForeground(trigger: .unlockNotification) }

        recoverPersistedSession()
        refreshStats()
    }

    // MARK: - User-initiated transitions

    func goFeral() {
        guard case .idle = phase else { return }
        let now = clock()
        phase = .armed(armedAt: now)
        defaults.set(now, forKey: PendingKey.armedAt)
        defaults.removeObject(forKey: PendingKey.lockedAt)
    }

    /// The understated "End" button — only reachable before the phone has
    /// actually locked, so there's nothing to bank.
    func cancelArmedSession() {
        guard case .armed = phase else { return }
        clearPersistedSession()
        phase = .idle
    }

    func goAgain() {
        guard case .result = phase else { return }
        goFeral()
    }

    func acknowledgeResult() {
        guard case .result = phase else { return }
        phase = .idle
    }

    // MARK: - Lock/unlock plumbing

    private func handleLockDetected() {
        guard case .armed(let armedAt) = phase else { return }
        let now = clock()
        phase = .locked(lockedAt: now)
        defaults.set(now, forKey: PendingKey.lockedAt)
        NotificationManager.shared.scheduleMilestones(from: now)
        _ = armedAt // pre-lock wait time never counts toward the session
    }

    enum ForegroundTrigger {
        case unlockNotification
        case appDidBecomeActive
    }

    /// The reliable path. Whether we get here via `protectedDataDidBecomeAvailable`
    /// (process survived) or plain `didBecomeActive` (process was suspended/relaunched),
    /// the logic is identical: stop trusting elapsed wall-clock ticking and just
    /// diff "now" against the persisted lock timestamp.
    func handleReturnToForeground(trigger: ForegroundTrigger) {
        guard case .locked(let lockedAt) = phase else { return }
        endLockedSession(lockedAt: lockedAt, endedAt: clock(), endedByUnlock: true)
    }

    func handleAppDidBecomeActive() {
        handleReturnToForeground(trigger: .appDidBecomeActive)
    }

    func handleAppDidEnterBackground() {
        // Intentionally a no-op: backgrounding without a lock notification
        // means the user switched apps, not that they went feral.
    }

    private func endLockedSession(lockedAt: Date, endedAt: Date, endedByUnlock: Bool) {
        let durationSec = max(0, Int(endedAt.timeIntervalSince(lockedAt)))
        let counted = durationSec >= minimumSessionSec()

        let session = Session(startedAt: lockedAt, endedAt: endedAt, counted: counted)
        modelContext.insert(session)
        try? modelContext.save()

        NotificationManager.shared.cancelMilestones()
        if endedByUnlock {
            NotificationManager.shared.sendCavedNotification(durationSec: durationSec, counted: counted)
        }

        clearPersistedSession()
        refreshStats()
        phase = .result(SessionResult(
            startedAt: lockedAt,
            endedAt: endedAt,
            durationSec: durationSec,
            counted: counted,
            endedByUnlock: endedByUnlock
        ))
    }

    // MARK: - Force-quit recovery

    /// Runs once at launch. A force-quit mid-session leaves timestamps in
    /// UserDefaults; we reconcile them against "now" the same way a live
    /// unlock would, since we have no better signal for when the phone
    /// actually unlocked while we were dead.
    private func recoverPersistedSession() {
        if let lockedAt = defaults.object(forKey: PendingKey.lockedAt) as? Date {
            endLockedSession(lockedAt: lockedAt, endedAt: clock(), endedByUnlock: true)
        } else if defaults.object(forKey: PendingKey.armedAt) as? Date != nil {
            // Armed but never locked before the process died — nothing accrued.
            clearPersistedSession()
        }
    }

    private func clearPersistedSession() {
        defaults.removeObject(forKey: PendingKey.armedAt)
        defaults.removeObject(forKey: PendingKey.lockedAt)
    }

    // MARK: - Stats

    func refreshStats() {
        streak = StatsCalculator.streak(in: modelContext)
        totalFeralSecToday = StatsCalculator.totalSecToday(in: modelContext)
        totalFeralSecAllTime = StatsCalculator.totalFeralSec(in: modelContext)
    }
}
