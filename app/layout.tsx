import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Speak With the Prophets | Bible Chat",
  description:
    "Talk with the voices of scripture. Ask Moses, Elijah, Deborah, Peter, or any figure from the Bible — grounded in their own words, ready to talk with you.",
  openGraph: {
    title: "Speak With the Prophets | Bible Chat",
    description:
      "Talk with the voices of scripture, grounded in their own words.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
