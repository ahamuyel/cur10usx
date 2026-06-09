"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, Sun, Moon, GraduationCap } from "lucide-react"
import { useTheme } from "@/provider/theme"
import type { PlatformBranding } from "@/types/landing"
import { useTranslation } from "@/lib/i18n"
import LocaleSwitcher from "./LocaleSwitcher"

export default function LandingNavbar({
  branding,
  locale = "pt",
}: {
  branding: PlatformBranding
  locale?: string
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(locale)
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { label: t("landing.nav.problems"), href: "#problems" },
    { label: t("landing.nav.transformation"), href: "#transformation" },
    { label: t("landing.nav.benefits"), href: "#benefits" },
    { label: t("landing.nav.vision"), href: "#vision" },
    { label: t("landing.nav.trust"), href: "#trust" },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observers = navLinks.map((link) => {
      const el = document.querySelector(link.href)
      if (!el) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(link.href)
          }
        },
        { rootMargin: "-30% 0px -60% 0px" }
      )
      observer.observe(el)
      return { observer, el }
    })

    return () => {
      observers.forEach((obs) => obs?.observer.unobserve(obs.el))
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    if (!open || !menuRef.current) return
    const firstFocusable = menuRef.current.querySelector<HTMLElement>("a, button")
    firstFocusable?.focus()
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[var(--landing-bg)]/80 backdrop-blur-md border-[var(--landing-border)] shadow-sm h-14"
          : "bg-[var(--landing-bg)] border-transparent h-16"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full gap-2 lg:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-transform group-hover:scale-105 group-hover:rotate-3">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--landing-text-primary)] hidden sm:block">
              Cur10us<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Desktop/Tablet Navigation - Espaçamentos e Margens Reduzidas em Telas Médias */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          {/* Desktop/Tablet Actions - Mais Compacto */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            <LocaleSwitcher currentLocale={locale} />
            
            <button
              onClick={toggleTheme}
              className="p-1.5 lg:p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="w-px h-5 bg-[var(--landing-border)] mx-0.5 lg:mx-1" />
            
            <Link
              href="/signin"
              className="text-xs lg:text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] px-2 lg:px-3 py-2 rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition"
            >
              {t("landing.nav.signin")}
            </Link>
            
            <Link
              href="/signup"
              className="text-xs lg:text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] px-2 lg:px-3 py-2 rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition hidden lg:block"
            >
              {t("landing.nav.explore")}
            </Link>
            
            <Link
              href="/registar-escola"
              className="text-xs lg:text-sm font-semibold text-white dark:text-zinc-900 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 px-2.5 lg:px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("landing.nav.demo")}
            </Link>
          </div>

          {/* Mobile Actions Button */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-all relative z-50 focus-visible:outline-none cursor-pointer"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <X size={20} className={`absolute transition-all duration-300 ${open ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"}`} />
                <Menu size={20} className={`absolute transition-all duration-300 ${open ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden fixed inset-x-0 z-40 bg-[var(--landing-bg)] border-b border-[var(--landing-border)] shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between overflow-y-auto subtle-scrollbar ${
          scrolled ? "top-14" : "top-16"
        } ${
          open 
            ? "h-[calc(100vh-4rem)] opacity-100 pointer-events-auto translate-y-0" 
            : "h-0 opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <div className="flex flex-col justify-between h-full min-h-[calc(100vh-5rem)] w-full">
          <div className="px-5 py-4 space-y-0.5">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{ 
                    transitionDelay: open ? `${index * 30}ms` : "0ms"
                  }}
                  className={`block text-base font-medium transition-all duration-300 transform py-2.5 px-4 rounded-xl ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                  } ${
                    isActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </div>

          <div 
            style={{ transitionDelay: open ? `${navLinks.length * 30}ms` : "0ms" }}
            className={`px-5 pb-8 pt-4 border-t border-[var(--landing-border)] space-y-4 bg-[var(--landing-bg-tertiary)] transition-all duration-300 transform ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--landing-text-dim)] px-4 pb-2">
                Conta
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-medium text-[var(--landing-text-primary)] py-2.5 px-3 rounded-xl bg-[var(--landing-bg)] border border-[var(--landing-border)] hover:bg-[var(--landing-bg-tertiary)] transition"
                >
                  {t("landing.nav.signin")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-medium text-[var(--landing-text-primary)] py-2.5 px-3 rounded-xl bg-[var(--landing-bg)] border border-[var(--landing-border)] hover:bg-[var(--landing-bg-tertiary)] transition"
                >
                  {t("landing.nav.explore")}
                </Link>
              </div>
            </div>

            <Link
              href="/registar-escola"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white dark:text-zinc-900 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 px-4 py-3 rounded-xl transition shadow-lg active:scale-[0.99]"
            >
              {t("landing.nav.demo")}
            </Link>

            <div className="pt-1 flex items-center justify-center">
              <LocaleSwitcher currentLocale={locale} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}