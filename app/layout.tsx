import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UCLA ASDA Fundraiser",
  description: "2025 UCLA ASDA Fundraiser: Porto's Bakery. Pre-order Now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased bg-[#f4f4f4]`}>
        {children}
        <Toaster richColors />
        <Footer />
      </body>
    </html>
  );
}
