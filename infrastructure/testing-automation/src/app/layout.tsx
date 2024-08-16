import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TDD",
  description: "TDD backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
