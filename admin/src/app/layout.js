import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import EgoisticNavbar from "@/lib/EgosticNavbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Plan to Empower | Admin CMS Dashboard",
  description:
    "The CMS dashboard for Plan to Empower allows admins to manage content, track activities, distribute resources, and oversee campaigns effectively. Built to empower operations and streamline social impact efforts.",
  keywords:
    "Plan to Empower, CMS, admin dashboard, content management, resource distribution, social impact, NGO platform, campaign management",
  author: "Plan to Empower Team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EgoisticNavbar />
          {children}
        </ThemeProvider>
        <Toaster/>
      </body>
    </html>
  );
}
