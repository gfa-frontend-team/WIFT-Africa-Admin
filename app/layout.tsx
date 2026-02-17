import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ProfileProvider } from "@/lib/hooks/useDetails";

export const metadata: Metadata = {
  title: "WIFT Africa Admin",
  description:
    "Admin dashboard for WIFT Africa - Manage chapters, members, and membership requests",
  icons: {
    icon: "/fav.png",
    shortcut: "/fav.png",
    apple: "/fav.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProfileProvider>

            {children}
            </ProfileProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
