import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Annlin Gemeente",
  description: "Amptelike webwerf van die Annlin Gemeente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="af">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
