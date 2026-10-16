import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { RoleProvider } from "@/context/role-context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RouteShare — Smart Ride-Sharing & Daily Commute (Tamil Nadu)",
  description:
    "Book verified Auto, Bike Taxi, Mini, Prime Cabs and Corridor Shuttles across Tamil Nadu. Transparent upfront fares in ₹, instant 4-digit start OTP, and zero surge carpooling.",
  keywords: [
    "ride sharing",
    "chennai cabs",
    "tamil nadu auto",
    "bike taxi",
    "omr carpool",
    "namma auto",
    "rapido style bike",
    "smart transit",
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
        <RoleProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

