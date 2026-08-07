import Foundation
import SwiftData

@Model
final class Session {
    @Attribute(.unique) var id: UUID
    var startedAt: Date
    var endedAt: Date
    var durationSec: Int
    var counted: Bool

    init(id: UUID = UUID(), startedAt: Date, endedAt: Date, counted: Bool) {
        self.id = id
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.durationSec = max(0, Int(endedAt.timeIntervalSince(startedAt)))
        self.counted = counted
    }
}
