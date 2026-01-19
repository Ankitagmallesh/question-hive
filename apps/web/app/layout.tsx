import "../../../packages/ui/src/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import LenisProvider from "components/providers/lenis-provider";
import { Toaster } from "../components/ui/toaster";
import { Toaster as SonnerToaster } from "../components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// We are adding these links to support the new Question Paper Designer UI
// strictly following the user's "as it is" request for imports.

export const metadata: Metadata = {
  title: "Question Hive - AI-Powered Question Paper Generation",
  description: "Streamline question paper creation for educational institutions with our comprehensive platform featuring AI-generated questions, automated grading, and seamless exam management.",
  keywords: ["education", "question papers", "AI", "exam management", "educational technology"],
  authors: [{ name: "Question Hive Team" }],
  openGraph: {
    title: "Question Hive - AI-Powered Question Paper Generation",
    description: "Streamline question paper creation for educational institutions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Plus Jakarta Sans corresponds to next/font/google usage below */}
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={jakarta.className}>
        <LenisProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </LenisProvider>
      </body>
    </html>
  );
}
