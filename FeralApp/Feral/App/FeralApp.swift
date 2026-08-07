import SwiftUI
import SwiftData

@main
struct FeralApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @Environment(\.scenePhase) private var scenePhase

    let modelContainer = PersistenceController.shared.container
    @State private var sessionEngine: SessionEngine

    init() {
        let engine = SessionEngine(modelContext: PersistenceController.shared.container.mainContext)
        _sessionEngine = State(initialValue: engine)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(sessionEngine)
                .preferredColorScheme(.dark)
        }
        .modelContainer(modelContainer)
        .onChange(of: scenePhase) { _, newPhase in
            switch newPhase {
            case .active:
                sessionEngine.handleAppDidBecomeActive()
            case .background:
                sessionEngine.handleAppDidEnterBackground()
            default:
                break
            }
        }
    }
}
