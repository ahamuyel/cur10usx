import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/provider/theme";
import { AuthProvider } from "@/provider/auth";
import SessionGuard from "@/components/layout/SessionGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cur10usX — O futuro da educação acadêmica africana",
  description:
    "Plataforma de gestão escolar moderna. Centralize alunos, professores, notas e comunicação numa só plataforma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <SessionGuard>{children}</SessionGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
