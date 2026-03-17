import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/store/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Mentovara — Learn Without Limits",
  description:
    "Mentovara is a modern EdTech platform where instructors create courses and students learn through structured video content with progress tracking.",
  keywords: ["edtech", "courses", "learning", "mentovara", "online education"],
  icons: {
    icon: [
      { url: "/temp/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/temp/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/temp/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// Inline script to apply saved theme before paint (avoids flash of wrong theme)
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

