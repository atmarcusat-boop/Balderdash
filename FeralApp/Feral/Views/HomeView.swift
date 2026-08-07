import SwiftUI

struct HomeView: View {
    @Environment(SessionEngine.self) private var sessionEngine
    @State private var faceDownDetector = FaceDownDetector()
    @State private var subline = Copy.randomIdleSubline()

    var body: some View {
        VStack(spacing: Theme.Spacing.xl) {
            VStack(spacing: Theme.Spacing.sm) {
                statRow(label: "TODAY", value: DurationFormatter.words(sessionEngine.totalFeralSecToday))
                statRow(label: "STREAK", value: streakValue)
            }

            FeralPrimaryButton(title: "GO FERAL") {
                sessionEngine.goFeral()
            }

            Text(subline)
                .font(Theme.Font.ui(15))
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.Spacing.lg)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.background.ignoresSafeArea())
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink {
                    StatsView()
                } label: {
                    Image(systemName: "chart.bar.fill")
                        .foregroundStyle(Theme.accent)
                }
            }
        }
        .onAppear {
            faceDownDetector.onFaceDownConfirmed = { sessionEngine.goFeral() }
            faceDownDetector.startMonitoring()
        }
        .onDisappear {
            faceDownDetector.stopMonitoring()
        }
    }

    private var streakValue: String {
        sessionEngine.streak.current == 1 ? "1 day" : "\(sessionEngine.streak.current) days"
    }

    private func statRow(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(label)
                .font(Theme.Font.ui(12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(Theme.textSecondary)
            Text(value)
                .font(Theme.Font.counter(28))
                .foregroundStyle(Theme.textPrimary)
        }
    }
}
