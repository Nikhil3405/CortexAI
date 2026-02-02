import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "CortexAI",
  description: "A chatbot powered for PDFs",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
