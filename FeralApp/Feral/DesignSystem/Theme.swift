import SwiftUI

/// Design tokens. One saturated accent, near-black ground, bone as the only
/// alt surface. Colors are defined in code rather than the asset catalog so
/// they're easy to tweak without touching Xcode.
enum Theme {
    /// Acid green. Swap for cobalt (`Color(hex: 0x2D5BFF)`) if you want the
    /// colder palette instead.
    static let accent = Color(hex: 0xC6FF3D)

    static let background = Color(hex: 0x0A0A0A)
    static let surface = Color(hex: 0x161616)
    static let bone = Color(hex: 0xF5F1E8)

    static let textPrimary = Color(hex: 0xF5F1E8)
    static let textSecondary = Color(hex: 0x8A8A8A)

    enum Font {
        /// Big monospace digits — the live counter, the only thing that ticks.
        static func counter(_ size: CGFloat) -> SwiftUI.Font {
            .system(size: size, weight: .bold, design: .monospaced)
        }

        /// Tight grotesque for everything else.
        static func ui(_ size: CGFloat, weight: SwiftUI.Font.Weight = .regular) -> SwiftUI.Font {
            .system(size: size, weight: weight, design: .default)
        }
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 32
        static let xl: CGFloat = 64
    }
}

extension Color {
    init(hex: UInt32) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
