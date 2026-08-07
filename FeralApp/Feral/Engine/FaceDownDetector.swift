import CoreMotion
import Observation

/// Optional flourish: notice the phone has been set face-down on a flat
/// surface and offer to start a session hands-free. Foreground-only —
/// CoreMotion updates stop the moment the app backgrounds, so this can never
/// be the primary detection mechanism (that's `LockStateMonitor`'s job).
@Observable
final class FaceDownDetector {
    private(set) var isFaceDown = false

    private let motionManager = CMMotionManager()
    private let queue = OperationQueue()

    /// z acceleration near -1g means the screen is pointed at the ground.
    private let faceDownThreshold = -0.85
    /// Require it to hold briefly so picking the phone up and setting it
    /// back down doesn't register as a false trigger.
    private let sustainedDuration: TimeInterval = 1.0

    private var candidateSince: Date?

    var onFaceDownConfirmed: (() -> Void)?

    func startMonitoring() {
        guard motionManager.isAccelerometerAvailable else { return }
        motionManager.accelerometerUpdateInterval = 0.2
        motionManager.startAccelerometerUpdates(to: queue) { [weak self] data, _ in
            guard let self, let z = data?.acceleration.z else { return }
            DispatchQueue.main.async {
                self.evaluate(zAcceleration: z)
            }
        }
    }

    func stopMonitoring() {
        motionManager.stopAccelerometerUpdates()
        candidateSince = nil
        isFaceDown = false
    }

    private func evaluate(zAcceleration z: Double) {
        guard z <= faceDownThreshold else {
            candidateSince = nil
            isFaceDown = false
            return
        }

        let now = Date()
        let since = candidateSince ?? now
        candidateSince = since

        if !isFaceDown, now.timeIntervalSince(since) >= sustainedDuration {
            isFaceDown = true
            onFaceDownConfirmed?()
        }
    }
}
