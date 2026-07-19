import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grammar Detective — The Alibi Error",
  description: "Solve the grammar error in each witness statement to crack the case.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-secondary-noir">{children}</body>
    </html>
  );
}
