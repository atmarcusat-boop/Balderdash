import SwiftUI

/// The big central call-to-action. One of these per screen, at most.
struct FeralPrimaryButton: View {
    let title: String
    let action: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Font.ui(20, weight: .heavy))
                .tracking(1.5)
                .foregroundStyle(Theme.background)
                .frame(width: 200, height: 200)
                .background(Circle().fill(Theme.accent))
                .scaleEffect(isPressed && !reduceMotion ? 0.96 : 1)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
        .accessibilityLabel(title)
    }
}

/// The deliberately understated "End" button on the active session screen.
struct FeralGhostButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .font(Theme.Font.ui(14))
            .foregroundStyle(Theme.textSecondary)
    }
}
