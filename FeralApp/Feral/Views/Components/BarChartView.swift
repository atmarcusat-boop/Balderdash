import SwiftUI

/// Simple last-7-days bar chart. No charting framework — seven bars is not
/// worth the dependency.
struct BarChartView: View {
    let dayStats: [DayStat]

    private var maxSec: Int {
        max(dayStats.map(\.totalSec).max() ?? 0, 1)
    }

    var body: some View {
        HStack(alignment: .bottom, spacing: Theme.Spacing.sm) {
            ForEach(dayStats, id: \.date) { stat in
                VStack(spacing: Theme.Spacing.xs) {
                    Spacer(minLength: 0)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(stat.metThreshold ? Theme.accent : Theme.surface)
                        .frame(height: barHeight(for: stat))
                    Text(weekdayLabel(for: stat.date))
                        .font(Theme.Font.ui(11))
                        .foregroundStyle(Theme.textSecondary)
                }
            }
        }
        .frame(height: 140)
    }

    private func barHeight(for stat: DayStat) -> CGFloat {
        let fraction = CGFloat(stat.totalSec) / CGFloat(maxSec)
        return max(4, fraction * 110)
    }

    private func weekdayLabel(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEEE"
        return formatter.string(from: date)
    }
}
