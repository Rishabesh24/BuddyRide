import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RouteShare — Algorithmic Carpooling & Smart Ride-Sharing Platform",
  description:
    "Connect with verified drivers and passengers traveling along your exact route. Enjoy transparent proportional fares and minimized detours with geometric route matching.",
  keywords: [
    "carpooling",
    "ride sharing",
    "commute sharing",
    "route matching",
    "smart transit",
    "cost sharing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-commuter-50 text-commuter-900 antialiased selection:bg-mobility-100 selection:text-mobility-900" suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
