import type { Metadata } from "next";
import { Inter, Titan_One } from "next/font/google";
import "./globals.css";

// Body & UI font (PRD-LANDING.md section 3)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headline font (PRD-LANDING.md section 3)
const titanOne = Titan_One({
  weight: "400",
  variable: "--font-titan-one",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bank Sampah Digital",
  description: "Landing page Bank Sampah Digital & Daur Ulang",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${titanOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
