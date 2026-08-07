# Feral (v1)

Lock your phone, bank the time. SwiftUI + SwiftData, no backend.

> Written and reviewed on a Linux container with no Xcode/Swift toolchain
> available, so nothing here has been compiled or run on-device yet. The code
> follows standard SwiftUI/SwiftData/UIKit APIs throughout; open it in Xcode
> and fix any straggling syntax issues before you trust it.

## Build

This project uses [XcodeGen](https://github.com/yonaskolb/XcodeGen) instead of
a committed `.xcodeproj`, so the project file doesn't rot as files move.

```sh
brew install xcodegen   # if you don't have it
cd FeralApp
xcodegen generate
open Feral.xcodeproj
```

Requires iOS 17+ (SwiftData, `@Observable`, `TimelineView`).

## Architecture

- `Engine/SessionEngine.swift` — the state machine: `idle → armed → locked → result`.
  Timestamp-driven, not timer-driven — see the doc comment at the top of the
  file for why. Injects a `clock: () -> Date` closure so the whole thing is
  unit-testable without real sleeping (see `FeralTests/SessionEngineTests.swift`).
- `Engine/LockStateMonitor.swift` — wraps `protectedDataWillBecomeUnavailable`
  / `protectedDataDidBecomeAvailable`, the closest thing iOS exposes to
  "screen locked" / "screen unlocked" for a third-party app.
- `Engine/FaceDownDetector.swift` — optional flourish, foreground-only,
  CoreMotion-based. Not part of the core loop.
- `Persistence/` — `PersistenceController` (SwiftData `ModelContainer`) and
  `StatsCalculator` (pure functions deriving day rollups / streaks from
  `Session` history — nothing is cached, the dataset is small enough to
  recompute on demand).
- `Notifications/NotificationManager.swift` — milestone notifications
  (30m/1h/2h/4h) scheduled with time-interval triggers off the lock timestamp,
  plus the immediate "you caved" notification on unlock.
- `Views/` — the five screens (`HomeView`, `ActiveSessionView`,
  `SessionResultView`, `StatsView`, `ShareCardView`) plus `RootView`, which
  switches between them based on `SessionEngine.phase`.
- `ShareCard/ShareCardRenderer.swift` — renders the Stories-sized share image
  via `ImageRenderer`.
- `DesignSystem/` — `Theme.swift` (color/type/spacing tokens) and
  `Copy.swift` (all the deadpan microcopy, in one place, scaled by duration).

## Known limitations (v1, by design)

- `protectedDataWillBecomeUnavailable` isn't guaranteed to fire the instant
  the screen locks — Apple ties it to file-protection key eviction, which can
  lag lock by up to ~10s. The 2-minute minimum grace period absorbs that.
- If iOS suspends or kills the app process while the phone is locked, we
  don't get the unlock notification live. `SessionEngine` covers this by
  persisting the lock timestamp to `UserDefaults` and reconciling against
  "now" the next time the app becomes active (relaunch or resume) — see
  `recoverPersistedSession()`.
- No Family Controls / DeviceActivity (Screen Time API). If a future version
  wants "phone unused" detection that's tamper-resistant, that's the
  replacement for `LockStateMonitor` — it needs its own entitlement and a
  much heavier permission flow, intentionally out of scope for v1.
- `AppIcon.appiconset/icon-1024.png` is a generated placeholder (solid
  background + accent circle), not real icon art — swap it before shipping.

## Testing

```sh
xcodegen generate
xcodebuild test -project Feral.xcodeproj -scheme Feral -destination 'platform=iOS Simulator,name=iPhone 15'
```

`SessionEngineTests` drives lock/unlock through the injected clock and
`LockStateMonitor` callbacks (no real waiting). `StatsCalculatorTests` covers
streak math (consecutive days, gaps) and the 7-day rollup window.
