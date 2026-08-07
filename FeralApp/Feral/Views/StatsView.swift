import SwiftUI
import SwiftData

struct StatsView: View {
    @Environment(SessionEngine.self) private var sessionEngine
    @Environment(\.modelContext) private var modelContext
    @State private var dayStats: [DayStat] = []

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                HStack(spacing: Theme.Spacing.lg) {
                    statTile(label: "TOTAL HOURS FERAL", value: totalHoursLabel)
                    statTile(label: "CURRENT STREAK", value: "\(sessionEngine.streak.current)")
                }
                HStack(spacing: Theme.Spacing.lg) {
                    statTile(label: "LONGEST SESSION", value: DurationFormatter.words(longestSessionSec))
                    statTile(label: "DAYS FERAL", value: "\(sessionEngine.streak.totalFeralDays)")
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("LAST 7 DAYS")
                        .font(Theme.Font.ui(12, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(Theme.textSecondary)
                    BarChartView(dayStats: dayStats)
                }
                .padding(.top, Theme.Spacing.md)
            }
            .padding(Theme.Spacing.lg)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle("Stats")
        .onAppear(perform: refresh)
    }

    private var totalHoursLabel: String {
        let hours = Double(sessionEngine.totalFeralSecAllTime) / 3600
        return String(format: "%.1f", hours)
    }

    private var longestSessionSec: Int {
        StatsCalculator.longestSessionSec(in: modelContext)
    }

    private func refresh() {
        dayStats = StatsCalculator.dayStats(in: modelContext)
    }

    private func statTile(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(label)
                .font(Theme.Font.ui(11, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(Theme.textSecondary)
            Text(value)
                .font(Theme.Font.counter(30))
                .foregroundStyle(Theme.accent)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.md)
        .background(Theme.surface, in: RoundedRectangle(cornerRadius: 12))
    }
}
