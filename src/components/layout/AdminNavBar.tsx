"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import ThemeToggle from "@/components/ui/ThemeToggle"

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/schools": "Escolas",
  "/admin/users": "Utilizadores",
  "/admin/super-admins": "Super Admins",
  "/admin/applications": "Solicitações",
  "/admin/settings": "Configurações",
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith("/admin/schools/")) return "Detalhes da Escola"
  return "Admin"
}

const AdminNavBar = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const title = getPageTitle(pathname)

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b border-border">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1.5">
          <span className="font-bold text-foreground text-sm">
            Cur10us<span className="text-primary">X</span>
          </span>
        </Link>
        <span className="text-border">|</span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden min-[400px]:block">{session?.user?.name}</span>
        <ThemeToggle />
      </div>
    </div>
  )
}

export default AdminNavBar
