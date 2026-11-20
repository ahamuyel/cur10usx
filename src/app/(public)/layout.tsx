import Link from "next/link"
import { getPlatformConfig } from "@/lib/platform-config"
import Image from "next/image"
import PublicNav from "@/components/landing/PublicNav"

async function PublicBrand() {
  let name = "Cur10usX"
  try {
    const config = await getPlatformConfig()
    name = config.name
  } catch {
    /* fallback to default name when DB is unavailable */
  }
  if (name === "Cur10usX") {
    return (
      <span className="text-lg font-bold tracking-tight">
        Cur10us<span className="text-primary">X</span>
      </span>
    )
  }
  return <span className="text-lg font-bold tracking-tight">{name}</span>
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-50/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/blacklogo.png"
              alt="Cur10usX"
              width={28}
              height={28}
              className="rounded-lg transition-transform group-hover:scale-105 dark:hidden"
            />
            <Image
              src="/whitelogo.png"
              alt="Cur10usX"
              width={28}
              height={28}
              className="rounded-lg transition-transform group-hover:scale-105 hidden dark:block"
            />
            <PublicBrand />
          </Link>
          <PublicNav />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
