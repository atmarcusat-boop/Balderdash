import SwiftUI
import UIKit

struct ShareCardView: View {
    let durationSec: Int

    @Environment(\.dismiss) private var dismiss
    @State private var renderedImage: UIImage?
    @State private var isActivityPresented = false

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            ShareCardContent(durationSec: durationSec)
                .frame(width: ShareCardContent.size.width, height: ShareCardContent.size.height)
                .scaleEffect(0.28)
                .frame(
                    width: ShareCardContent.size.width * 0.28,
                    height: ShareCardContent.size.height * 0.28
                )
                .clipShape(RoundedRectangle(cornerRadius: 16))

            Button("Share") {
                isActivityPresented = true
            }
            .font(Theme.Font.ui(17, weight: .semibold))
            .foregroundStyle(Theme.background)
            .padding(.horizontal, Theme.Spacing.lg)
            .padding(.vertical, Theme.Spacing.sm)
            .background(Theme.accent, in: Capsule())

            FeralGhostButton(title: "Done") {
                dismiss()
            }
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.background.ignoresSafeArea())
        .onAppear {
            renderedImage = ShareCardRenderer.render(durationSec: durationSec)
        }
        .sheet(isPresented: $isActivityPresented) {
            if let renderedImage {
                ActivityView(activityItems: [renderedImage])
            }
        }
    }
}

/// UIActivityViewController wrapper — SwiftUI has no native share sheet for images.
struct ActivityView: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
