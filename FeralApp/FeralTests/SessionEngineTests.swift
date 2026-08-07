import XCTest
import SwiftData
@testable import Feral

final class SessionEngineTests: XCTestCase {
    private var container: ModelContainer!
    private var defaults: UserDefaults!

    override func setUpWithError() throws {
        let schema = Schema([Session.self])
        container = try ModelContainer(for: schema, configurations: [ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)])
        defaults = UserDefaults(suiteName: "SessionEngineTests." + UUID().uuidString)
    }

    private func makeEngine(clock: @escaping () -> Date, minimumSessionSec: Int = 120) -> SessionEngine {
        SessionEngine(
            modelContext: container.mainContext,
            defaults: defaults,
            lockMonitor: LockStateMonitor(),
            minimumSessionSec: { minimumSessionSec },
            clock: clock
        )
    }

    func testGoFeralArmsSession() {
        let now = Date()
        let engine = makeEngine(clock: { now })

        engine.goFeral()

        guard case .armed = engine.phase else {
            return XCTFail("expected .armed, got \(engine.phase)")
        }
    }

    func testLockThenReturnBanksSessionAboveMinimum() {
        var now = Date()
        let engine = makeEngine(clock: { now }, minimumSessionSec: 120)

        engine.goFeral()
        engine.lockMonitor.onLock?()

        guard case .locked = engine.phase else {
            return XCTFail("expected .locked, got \(engine.phase)")
        }

        now = now.addingTimeInterval(130) // 2m10s of feral time
        engine.handleAppDidBecomeActive()

        guard case .result(let result) = engine.phase else {
            return XCTFail("expected .result, got \(engine.phase)")
        }
        XCTAssertEqual(result.durationSec, 130)
        XCTAssertTrue(result.counted)
        XCTAssertEqual(engine.totalFeralSecAllTime, 130)
    }

    func testSessionUnderMinimumIsDiscarded() {
        var now = Date()
        let engine = makeEngine(clock: { now }, minimumSessionSec: 120)

        engine.goFeral()
        engine.lockMonitor.onLock?()
        now = now.addingTimeInterval(45) // under the 2-minute grace period

        engine.handleAppDidBecomeActive()

        guard case .result(let result) = engine.phase else {
            return XCTFail("expected .result, got \(engine.phase)")
        }
        XCTAssertFalse(result.counted)
        XCTAssertEqual(engine.totalFeralSecAllTime, 0)
    }

    func testCancelArmedSessionReturnsToIdleWithoutBanking() {
        let engine = makeEngine(clock: { Date() })

        engine.goFeral()
        engine.cancelArmedSession()

        XCTAssertEqual(engine.phase, .idle)
        XCTAssertEqual(engine.totalFeralSecAllTime, 0)
    }

    func testForceQuitMidSessionIsRecoveredOnRelaunch() {
        var now = Date()
        let firstEngine = makeEngine(clock: { now })
        firstEngine.goFeral()
        firstEngine.lockMonitor.onLock?()

        now = now.addingTimeInterval(300) // 5 minutes locked, then the process dies

        // A fresh engine instance simulates relaunch: same UserDefaults, same model context.
        let secondEngine = makeEngine(clock: { now })

        guard case .result(let result) = secondEngine.phase else {
            return XCTFail("expected recovered .result, got \(secondEngine.phase)")
        }
        XCTAssertEqual(result.durationSec, 300)
        XCTAssertTrue(result.counted)
    }
}
