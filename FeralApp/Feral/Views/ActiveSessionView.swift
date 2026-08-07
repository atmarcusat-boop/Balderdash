import SwiftUI

/// Live counter. Ticks locally via `TimelineView` while the app is
/// foregrounded — this is purely cosmetic. The instant the app backgrounds
/// (screen locks), iOS stops updating this view; the real, authoritative
/// duration is computed later from timestamps in `SessionEngine`.
struct ActiveSessionView: View {
    let startedAt: Date

    @Environment(SessionEngine.self) private var sessionEngine

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            TimelineView(.periodic(from: startedAt, by: 1)) { context in
                Text(DurationFormatter.clock(elapsedSec(at: context.date)))
                    .font(Theme.Font.counter(64))
                    .foregroundStyle(Theme.accent)
                    .monospacedDigit()
            }

            Text(Copy.activeSessionLine)
                .font(Theme.Font.ui(16))
                .foregroundStyle(Theme.textSecondary)

            Spacer()

            FeralGhostButton(title: "End") {
                sessionEngine.cancelArmedSession()
            }
            .padding(.bottom, Theme.Spacing.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.background.ignoresSafeArea())
        .statusBarHidden()
    }

    private func elapsedSec(at date: Date) -> Int {
        max(0, Int(date.timeIntervalSince(startedAt)))
    }
}
