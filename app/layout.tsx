import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./themes.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { themeInitializationScript } from "@/lib/themes";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Annlin Gemeente",
  description: "Amptelike webwerf van die Annlin Gemeente",
  icons: {
    icon: "/annlin-mark.png",
    apple: "/annlin-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="af" data-theme="heritage" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className={`${sourceSans.variable} ${cormorant.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
