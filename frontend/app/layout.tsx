import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import AOSInit from "@/utils/Aos";
import { Toaster } from "@/components/ui/sonner";
import HomeHeader from "@/components/header/home-header";
import Footer from "@/components/home/Footer";

// Configure the Roboto font with all weights and styles
const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-roboto", // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: "YUMMY FLY",
  description: "YUMMY FLY restaurant",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next15", "pwa", "next-pwa"],
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],

  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "icons/apple-touch-icon.png" },
    { rel: "icon", url: "icons/favicon-96x96.png" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} font-sans antialiased`}>
      {/* Apply the Roboto font globally */}
      <body>
        <HomeHeader />
        <Toaster />
        <AOSInit />
        {children}
        <Footer />
      </body>
    </html>
  );
}
