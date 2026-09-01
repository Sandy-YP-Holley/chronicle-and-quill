import type { Metadata, Viewport } from "next";
import { Cinzel, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/store-context";
import { Navbar } from "@/components/layout/navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF9F5",
};

export const metadata: Metadata = {
  title: "Chronicle & Quill | Antiquarian & Historical Bookstore",
  description:
    "An archival sanctuary of rare, classical, and historical literature spanning Antiquity, Medieval, Early Modern, and the 20th Century.",
  keywords: [
    "history books",
    "antiquarian books",
    "rare literature",
    "historical bookstore",
    "chronicle and quill",
    "classical history",
  ],
  authors: [{ name: "Chronicle & Quill" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBF9F5] text-[#1C1917]">
        <StoreProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1 flex flex-col">{children}</main>
          <MobileNav />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
