"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/provider/theme"
import type { PlatformBranding } from "@/types/landing"

const navLinks = [
  { label: "Problemas", href: "#problemas" },
  { label: "Solução", href: "#solucao" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Visão", href: "#visao" },
]

export default function LandingNavbar({ branding }: { branding: PlatformBranding }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/80 dark:bg-warm-950/80 border-b border-warm-200/50 dark:border-warm-800/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 bg-gradient-to-br from-growth-500 to-growth-700 flex items-center justify-center shadow-lg shadow-black/10 group-hover:shadow-black/20 transition-shadow duration-300"
          >
            <span className="text-white font-bold text-sm">CX</span>
          </motion.div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-warm-900 dark:text-warm-100">Cur10us</span>
            <span className="text-growth-600 dark:text-growth-400">X</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200 px-3 py-2 hover:bg-warm-100/50 dark:hover:bg-warm-800/50"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100/50 dark:hover:bg-warm-800/50 transition-all duration-200"
            aria-label="Alternar tema"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {theme === "dark" ? (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </motion.div>
          </button>

          <Link
            href="/signup"
            className="hidden sm:inline-block text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200 px-4 py-2 hover:bg-warm-100/50 dark:hover:bg-warm-800/50"
          >
            Criar conta
          </Link>
          <Link
            href="/signin"
            className="px-5 py-2.5 text-sm bg-growth-600 text-white font-medium hover:bg-growth-700 shadow-lg shadow-black/10 hover:shadow-black/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Entrar
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition-all duration-200"
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-warm-200/50 dark:border-warm-800/50 backdrop-blur-xl bg-white/80 dark:bg-warm-950/80"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200 py-2.5 px-3 hover:bg-warm-100/50 dark:hover:bg-warm-800/50"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-warm-200/50 dark:border-warm-800/50 mt-2 flex flex-col gap-2">
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-sm text-warm-600 dark:text-warm-400 font-medium py-2.5 px-3 hover:bg-warm-100 dark:hover:bg-warm-900/50 transition-colors duration-200"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="text-sm text-warm-600 dark:text-warm-400 font-medium py-2.5 px-3 hover:bg-warm-100/50 dark:hover:bg-warm-800/50 transition-colors duration-200"
                >
                  Criar conta
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
