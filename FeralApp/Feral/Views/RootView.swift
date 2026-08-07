import SwiftUI

/// Switches between the app's phases. Each phase maps to exactly one of the
/// five screens (Stats is reached separately, via a toolbar button on Home).
struct RootView: View {
    @Environment(SessionEngine.self) private var sessionEngine

    var body: some View {
        Group {
            switch sessionEngine.phase {
            case .idle:
                NavigationStack {
                    HomeView()
                }
            case .armed(let armedAt):
                ActiveSessionView(startedAt: armedAt)
            case .locked(let lockedAt):
                ActiveSessionView(startedAt: lockedAt)
            case .result(let result):
                SessionResultView(result: result)
            }
        }
        .animation(.default, value: sessionEngine.phase)
        .background(Theme.background.ignoresSafeArea())
    }
}
