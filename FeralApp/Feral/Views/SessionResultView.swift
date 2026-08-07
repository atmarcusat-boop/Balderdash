import SwiftUI

struct SessionResultView: View {
    let result: SessionResult

    @Environment(SessionEngine.self) private var sessionEngine
    @State private var isSharePresented = false

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Text(DurationFormatter.words(result.durationSec))
                .font(Theme.Font.counter(56))
                .foregroundStyle(result.counted ? Theme.accent : Theme.textSecondary)

            Text(Copy.verdict(durationSec: result.durationSec, counted: result.counted))
                .font(Theme.Font.ui(20, weight: .semibold))
                .foregroundStyle(Theme.textPrimary)

            if !result.counted {
                Text("Under 2 minutes doesn't count. Try harder.")
                    .font(Theme.Font.ui(14))
                    .foregroundStyle(Theme.textSecondary)
            }

            Spacer()

            VStack(spacing: Theme.Spacing.md) {
                FeralPrimaryButton(title: "AGAIN") {
                    sessionEngine.goAgain()
                }

                if result.counted {
                    Button("Share") {
                        isSharePresented = true
                    }
                    .font(Theme.Font.ui(16, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary)
                } else {
                    FeralGhostButton(title: "Back home") {
                        sessionEngine.acknowledgeResult()
                    }
                }
            }
            .padding(.bottom, Theme.Spacing.xl)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.background.ignoresSafeArea())
        .sheet(isPresented: $isSharePresented, onDismiss: {
            sessionEngine.acknowledgeResult()
        }) {
            ShareCardView(durationSec: result.durationSec)
        }
    }
}
