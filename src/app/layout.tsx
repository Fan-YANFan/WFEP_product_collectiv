import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReminderAlertBanner } from "@/components/ReminderAlertBanner";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CookieProvider } from "@/context/CookieContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Collectiv",
    template: "%s | Collectiv",
  },
  description:
    "Find Hong Kong recyclable collection points and manage your member account — order history, saved locations, and recycling event reminders.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        <CookieProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <ReminderAlertBanner />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <CartDrawer />
                <CookieBanner />
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </CookieProvider>
      </body>
    </html>
  );
}
