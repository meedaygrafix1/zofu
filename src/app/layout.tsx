import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zofu — AI Resume Optimizer",
  description:
    "Amplify your resume for any job description. AI-powered ATS optimization, keyword matching, and interview preparation.",
  openGraph: {
    title: "Zofu — AI Resume Optimizer",
    description:
      "Amplify your resume for any job description. AI-powered ATS optimization, keyword matching, and interview preparation.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zofu — AI Resume Optimizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zofu — AI Resume Optimizer",
    description:
      "Amplify your resume for any job description. AI-powered ATS optimization, keyword matching, and interview preparation.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
