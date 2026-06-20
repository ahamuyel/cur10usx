"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  School,
  Users,
  Inbox,
  ShieldCheck,
  Settings,
  Menu,
  LogOut,
  LifeBuoy,
  BookOpen,
  SlidersHorizontal,
  BarChart3,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: School, label: "Escolas", href: "/admin/schools" },
  { icon: Users, label: "Utilizadores", href: "/admin/users" },
  { icon: Inbox, label: "Solicitações", href: "/admin/applications" },
]

const moreItems = [
  { icon: BookOpen, label: "Catálogo", href: "/admin/catalog" },
  { icon: SlidersHorizontal, label: "Config. Avaliação", href: "/admin/grading-config" },
  { icon: BarChart3, label: "Estatísticas", href: "/admin/stats" },
  { icon: ShieldCheck, label: "Super Admins", href: "/admin/super-admins" },
  { icon: LifeBuoy, label: "Suporte", href: "/admin/support" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
]

const AdminMobileNav = () => {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-[68px] left-2 right-2 bg-card rounded-card p-3 shadow-card border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
                  >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <button
                onClick={() => { setShowMore(false); signOut({ callbackUrl: "/signin" }) }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut size={16} className="shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
              showMore
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Menu size={20} strokeWidth={showMore ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default AdminMobileNav
