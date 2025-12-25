import type { Metadata } from "next";
import { Geist, Geist_Mono, Seymour_One  } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModalProvider } from "@/components/ModelProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const seymour = Seymour_One({
  weight: "400", // only available weight
  subsets: ["latin"],
  variable: "--font-seymour-one",
});

export const metadata: Metadata = {
  title: "Teach Boardly Interactive Online Whiteboard & Teaching Platform",
  description: "Teach Boardly empowers teachers and students with a collaborative online whiteboard, live drawing, voice chat, and seamless teaching tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
      </head>
      <body
      suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${seymour.variable} antialiased`}
        >
          {/* <DesmosScript/> */}
      <AuthProvider>
        <ModalProvider/>
        {children}
         <Toaster />
      </AuthProvider>
      </body>
    </html>
  );
}
