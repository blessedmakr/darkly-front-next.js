import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import ToastProvider from "../components/ToastProvider";

export const metadata: Metadata = {
  title: "Darkly",
  description:
    "A modern horror movie database for discovering slasher classics, psychological horror, supernatural dread, and cult favorites.",
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
            <Header overlay />
            <div className="relative pb-16 md:pb-0">{children}</div>
            <Footer />
            <BottomNav />
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}