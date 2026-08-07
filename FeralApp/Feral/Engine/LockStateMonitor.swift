import UIKit

/// Wraps the two notifications that stand in for "screen locked" / "screen
/// unlocked" on iOS, since there's no public API for the real thing.
///
/// `protectedDataWillBecomeUnavailable` fires when the device's file
/// protection keys are evicted, which happens shortly after the screen locks
/// (empirically within ~10s, not always instantly). `protectedDataDidBecomeAvailable`
/// fires on unlock. Both are only delivered while this app's process is
/// alive — see `SessionEngine`'s foreground-reconciliation path for how we
/// cover the case where iOS suspends or kills the process while locked.
final class LockStateMonitor {
    var onLock: (() -> Void)?
    var onUnlock: (() -> Void)?

    private var observers: [NSObjectProtocol] = []

    init() {
        let center = NotificationCenter.default
        observers.append(center.addObserver(
            forName: UIApplication.protectedDataWillBecomeUnavailableNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in self?.onLock?() })

        observers.append(center.addObserver(
            forName: UIApplication.protectedDataDidBecomeAvailableNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in self?.onUnlock?() })
    }

    deinit {
        let center = NotificationCenter.default
        observers.forEach { center.removeObserver($0) }
    }
}
