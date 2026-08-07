import XCTest
import SwiftData
@testable import Feral

final class StatsCalculatorTests: XCTestCase {
    private var container: ModelContainer!
    private var calendar: Calendar { .feral }

    override func setUpWithError() throws {
        let schema = Schema([Session.self])
        container = try ModelContainer(for: schema, configurations: [ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)])
        AppSettings.shared.streakThresholdSec = 1800
    }

    private func insertSession(daysAgo: Int, durationSec: Int, counted: Bool = true, now: Date = Date()) {
        let start = calendar.date(byAdding: .day, value: -daysAgo, to: calendar.startOfDay(for: now))!
            .addingTimeInterval(3600) // mid-morning, safely inside the day
        let end = start.addingTimeInterval(TimeInterval(durationSec))
        let session = Session(startedAt: start, endedAt: end, counted: counted)
        container.mainContext.insert(session)
    }

    func testTotalFeralSecOnlyCountsCountedSessions() {
        insertSession(daysAgo: 0, durationSec: 600, counted: true)
        insertSession(daysAgo: 0, durationSec: 30, counted: false)

        XCTAssertEqual(StatsCalculator.totalFeralSec(in: container.mainContext), 600)
    }

    func testCurrentStreakCountsConsecutiveDaysAboveThreshold() {
        let now = Date()
        insertSession(daysAgo: 0, durationSec: 1900, now: now) // today: hits threshold
        insertSession(daysAgo: 1, durationSec: 2000, now: now) // yesterday: hits threshold
        insertSession(daysAgo: 2, durationSec: 500, now: now)  // two days ago: below threshold, breaks streak

        let streak = StatsCalculator.streak(in: container.mainContext, now: now)
        XCTAssertEqual(streak.current, 2)
    }

    func testStreakResetsAfterMissedDay() {
        let now = Date()
        insertSession(daysAgo: 0, durationSec: 1900, now: now)
        insertSession(daysAgo: 2, durationSec: 1900, now: now) // gap at daysAgo: 1

        let streak = StatsCalculator.streak(in: container.mainContext, now: now)
        XCTAssertEqual(streak.current, 1)
        XCTAssertEqual(streak.longest, 1)
    }

    func testDayStatsReturnsRequestedWindowOldestFirst() {
        let now = Date()
        insertSession(daysAgo: 0, durationSec: 100, now: now)
        insertSession(daysAgo: 6, durationSec: 200, now: now)

        let stats = StatsCalculator.dayStats(in: container.mainContext, days: 7, now: now)

        XCTAssertEqual(stats.count, 7)
        XCTAssertEqual(stats.first?.totalSec, 200)
        XCTAssertEqual(stats.last?.totalSec, 100)
    }
}
