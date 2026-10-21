import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TestDriveProvider } from "@/context/TestDriveContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TestDriveModal from "@/components/modals/TestDriveModal";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier Curated Automotive | Showroom Siêu Xe & Xe Sang Tuyển Chọn",
  description: "Không gian trưng bày và phân phối xe thể thao, siêu xe và xe sang lướt nguyên bản đạt chuẩn kiểm định 150 điểm độc lập tại Việt Nam.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased min-h-screen flex flex-col bg-[#FBFBFA] text-[#121316]`}
      >
        <TestDriveProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <TestDriveModal />
        </TestDriveProvider>
      </body>
    </html>
  );
}
