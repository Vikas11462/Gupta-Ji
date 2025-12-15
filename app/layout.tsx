import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import SmoothScroll from "@/components/smooth-scroll";
import CustomCursor from "@/components/custom-cursor";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gupta Ji Store",
  description: "Order online from Gupta Ji Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(outfit.className, "min-h-screen bg-background font-sans antialiased")}>
        <AuthProvider>
          <CartProvider>
            <SmoothScroll />
            <CustomCursor />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
