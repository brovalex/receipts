import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeModeScript } from "flowbite-react";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Receipts App",
  description: "Receipts for celiac tax credit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <KindeProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <ThemeModeScript />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </KindeProvider>
  );
}
