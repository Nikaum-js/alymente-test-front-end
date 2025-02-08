import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body
        className={cn(
          "min-h-screen w-full bg-white text-black flex",
          inter.className,
          { "debug-screens": process.env.NODE_ENV === "development" }
        )}
      >
        <Sidebar />
        <div className="p-8 w-[80%]">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
