import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TestDriveProvider } from "@/context/TestDriveContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TestDriveModal from "@/components/modals/TestDriveModal";
import AtelierConciergeChat from "@/components/chat/AtelierConciergeChat";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-automotive.vn"),
  title: {
    default: "Atelier Curated Automotive | Showroom Siêu Xe & Xe Sang Tuyển Chọn",
    template: "%s | Atelier Curated Automotive",
  },
  description: "Không gian trưng bày và phân phối xe thể thao, siêu xe và xe sang lướt nguyên bản đạt chuẩn kiểm định 160 điểm độc lập tại Việt Nam.",
  keywords: ["showroom siêu xe", "xe sang", "Porsche", "Ferrari", "Mercedes-AMG", "xe lướt cao cấp", "Atelier Automotive"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://atelier-automotive.vn",
    siteName: "Atelier Curated Automotive",
    title: "Atelier Curated Automotive | Showroom Siêu Xe & Xe Sang Tuyển Chọn",
    description: "Không gian trưng bày và phân phối xe thể thao, siêu xe và xe sang lướt nguyên bản đạt chuẩn kiểm định 160 điểm độc lập tại Việt Nam.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier Curated Automotive | Showroom Siêu Xe & Xe Sang Tuyển Chọn",
    description: "Không gian trưng bày và phân phối xe thể thao, siêu xe và xe sang lướt nguyên bản đạt chuẩn kiểm định 160 điểm độc lập tại Việt Nam.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TestDriveProvider>
            <WishlistProvider>
              <CompareProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <TestDriveModal />
                <AtelierConciergeChat />
                <Toaster position="top-right" richColors />
              </CompareProvider>
            </WishlistProvider>
          </TestDriveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
