import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import ToastProvider from "../components/ToastProvider";
import WatchlistProvider from "../components/WatchlistProvider";
import FavoritesProvider from "../components/FavoritesProvider";
import RoleProvider from "../components/RoleProvider";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Darkly",
    template: "%s | Darkly",
  },
  description:
    "A modern horror movie database for discovering slasher classics, psychological horror, supernatural dread, and cult favorites.",
  openGraph: {
    type: "website",
    siteName: "Darkly",
    title: "Darkly",
    description:
      "A modern horror movie database for discovering slasher classics, psychological horror, supernatural dread, and cult favorites.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darkly",
    description:
      "A modern horror movie database for discovering slasher classics, psychological horror, supernatural dread, and cult favorites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <ClerkProvider>
          <ToastProvider>
            <RoleProvider>
            <WatchlistProvider>
            <FavoritesProvider>
              <Header overlay />
              <div className="relative pb-16 md:pb-0">{children}</div>
              <Footer />
              <BottomNav />
            </FavoritesProvider>
            </WatchlistProvider>
            </RoleProvider>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}