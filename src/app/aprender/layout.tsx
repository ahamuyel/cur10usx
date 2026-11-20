"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Flame, ArrowLeft, Home } from "lucide-react";

export default function AprenderLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role !== "student") {
      router.replace("/minha-area");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.role !== "student") {
    return null;
  }

  const showBack = pathname !== "/aprender" && pathname.startsWith("/aprender");

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-zinc-950">
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {showBack && pathname.startsWith("/aprender/caminhos") ? (
              <Link href="/aprender" className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Início">
                <Home size={18} />
              </Link>
            ) : showBack ? (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Voltar"
              >
                <ArrowLeft size={18} />
              </button>
            ) : null}
            <Link href="/aprender" className="font-bold text-zinc-900 dark:text-zinc-100">
              Cur10us<span className="text-primary">X</span>·Aprender
            </Link>
          </div>
          <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <Flame className="text-orange-500" size={18} />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
