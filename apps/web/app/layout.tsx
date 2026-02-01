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
  metadataBase: new URL('https://questionhive.in'), // Replace with actual domain
  title: {
    default: "Question Hive - AI-Powered Question Paper Generation",
    template: "%s | Question Hive"
  },
  description: "Streamline question paper creation for educational institutions with our comprehensive platform featuring AI-generated questions, automated grading, and seamless exam management.",
  keywords: ["education", "question papers", "AI", "exam management", "educational technology", "CBSE", "JEE", "NEET"],
  authors: [{ name: "Question Hive Team" }],
  creator: "Question Hive",
  publisher: "Question Hive",
  icons: {
    icon: "/logo-new.png",
    shortcut: "/logo-new.png",
    apple: "/logo-new.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://questionhive.in",
    title: "Question Hive - Create Exam Papers in Minutes",
    description: "AI-powered question paper generator for schools and tutors. Automate formatting, balanced difficulty, and instant PDF export.",
    siteName: "Question Hive",
    images: [
      {
        url: "/logo-new.png",
        width: 800,
        height: 800,
        alt: "Question Hive Logo",
      },
    ],
  },
  twitter: {
    card: "summary", // Use summary for square logo, summary_large_image for landscape
    title: "Question Hive",
    description: "Create professional exam papers in minutes with AI.",
    images: ["/logo-new.png"],
    creator: "@questionhive",
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
          <SonnerToaster 
            position="top-right" 
            theme="light"
            richColors 
            closeButton
            toastOptions={{
              style: {
                background: 'white',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                padding: '16px',
                minWidth: '300px'
              },
              classNames: {
                title: 'text-base font-bold text-slate-900',
                description: 'text-sm font-medium text-slate-600',
              }
            }}
          />
        </LenisProvider>
      </body>
    </html>
  );
}
