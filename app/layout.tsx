import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "One Punch Man Fan Project",
  description: "Community driven animation hub",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* REMOVED "bg-black" and added "bg-white text-gray-900" */}
      <body className={`${inter.className} bg-white text-gray-900`}>
        <Navbar />
        <main className="">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
