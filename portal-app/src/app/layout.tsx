import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pillow Dream Creators | Portal",
  description: "Pillow Market İçerik Üreticisi ve Yönetim Portalı",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={poppins.variable}>
      <body className="min-h-screen bg-[#0b0a1a] text-white antialiased" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
