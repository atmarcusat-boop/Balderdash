import SwiftUI

/// The image content itself, sized for Stories (9:16). Kept separate from
/// `ShareCardView` so the same content can be rendered off-screen at full
/// resolution while a smaller preview shows on screen.
struct ShareCardContent: View {
    let durationSec: Int

    static let size = CGSize(width: 1080, height: 1920)

    var body: some View {
        ZStack {
            Theme.background

            VStack(spacing: 48) {
                Spacer()

                Text(Copy.shareLine(durationSec: durationSec))
                    .font(.system(size: 72, weight: .bold, design: .monospaced))
                    .foregroundStyle(Theme.accent)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 80)

                Spacer()

                Text("FERAL")
                    .font(.system(size: 36, weight: .heavy, design: .default))
                    .tracking(8)
                    .foregroundStyle(Theme.textSecondary)
                    .padding(.bottom, 96)
            }
        }
        .frame(width: Self.size.width, height: Self.size.height)
    }
}

enum ShareCardRenderer {
    @MainActor
    static func render(durationSec: Int) -> UIImage? {
        let renderer = ImageRenderer(content: ShareCardContent(durationSec: durationSec))
        renderer.scale = 2
        return renderer.uiImage
    }
}
