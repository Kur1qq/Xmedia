import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xtudio",
  description: "Premium Studio & Production Services",
  icons: {
    icon: [
      { url: "/Xtudio_Logo_X (1)-1.png", sizes: "48x48", type: "image/png" },
    ],
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
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-black text-white min-h-screen`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          duration={2000}
          toastOptions={{
            style: {
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            },
            className: 'class-group'
          }}
        />
      </body>
    </html>
  );
}
