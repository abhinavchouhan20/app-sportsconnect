import type { Metadata } from "next";
import "./globals.css";
import { AppFrame } from "@/components/app-frame";
import { ClientProviders } from "@/components/client-providers";

export const metadata: Metadata = {
  title: "Astology",
  description: "Freemium AI astrology, palmistry, and tarot experience."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <AppFrame>{children}</AppFrame>
        </ClientProviders>
      </body>
    </html>
  );
}
