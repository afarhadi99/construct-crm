import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster"; // Shadcn UI Toaster

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "ConstructCRM - Modern CRM for Builders & Contractors",
    template: "%s | ConstructCRM",
  },
  description: "Streamline your construction projects, manage clients, and track progress with ConstructCRM. Built for modern builders and contractors.",
  keywords: ["construction crm", "builder software", "contractor crm", "project management", "saas"],
  authors: [{ name: "ConstructCRM Team" }],
  creator: "ConstructCRM Team",
  // Open Graph Metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Ensure this is set
    title: "ConstructCRM - Modern CRM for Builders & Contractors",
    description: "Streamline your construction projects with ConstructCRM.",
    siteName: "ConstructCRM",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/og-image.png`, // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "ConstructCRM Dashboard Preview",
      },
    ],
  },
  // Twitter Card Metadata
  twitter: {
    card: "summary_large_image",
    title: "ConstructCRM - Modern CRM for Builders & Contractors",
    description: "The ultimate CRM solution for the construction industry.",
    // site: "@YourTwitterHandle", // Optional: Your Twitter handle
    // creator: "@CreatorTwitterHandle", // Optional: Creator's Twitter handle
    images: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/twitter-image.png`], // Replace with your actual Twitter image URL
  },
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png", // Example sizes
    apple: "/apple-touch-icon.png",
  },
  // Manifest (for PWA capabilities)
  // manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }, // Adjust dark theme color
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Optional: to prevent zooming on mobile
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <AuthProvider>
          {/* ThemeProvider can be added here if you implement dark/light mode toggle */}
          <main className="flex-grow">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}