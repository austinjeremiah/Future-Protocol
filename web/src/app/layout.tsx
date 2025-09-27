import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "./providers/Web3Provider";
import { NetworkStatus } from "@/components/NetworkStatus";
import { NetworkSetupGuide } from "@/components/NetworkSetupGuide";
import { SetupChecker } from "@/components/SetupChecker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Future Protocol",
  description: "Web3 Time Capsule and Blockchain Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <NetworkStatus />
          <NetworkSetupGuide />
          <SetupChecker />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
