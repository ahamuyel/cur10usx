"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Sun, Moon, Globe, Check, ChevronDown } from "lucide-react"
import { useTheme } from "@/provider/theme"
import { useLocale, useSetLocale } from "@/provider/locale"
import type { PlatformBranding } from "@/types/landing"
import { useTranslation } from "@/lib/i18n"

const LOCALES = [
  { code: "pt", label: "Portugu\u00eas", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Fran\u00e7ais", short: "FR" },
] as const

const NAV_LINKS_KEYS = [
  "problems",
  "transformation",
  "ecosystem",
  "benefits",
  "trust",
] as const

type DropdownKind = "locale" | null

function useStableNavLinks(t: (key: string) => string) {
  return useMemo(
    () =>
      NAV_LINKS_KEYS.map((key) => ({
        label: t(`landing.nav.${key}`),
        href: `#${key}`,
      })),
    [t]
  )
}

export default memo(function LandingNavbar({
  branding: _branding,
}: {
  branding: PlatformBranding
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [dropdown, setDropdown] = useState<DropdownKind>(null)

  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const localeButtonRef = useRef<HTMLButtonElement>(null)
  const localeDropdownRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(56)

  const { t, locale: clientLocale } = useTranslation()
  const contextLocale = useLocale()
  const setLocale = useSetLocale()
  const { theme, toggleTheme } = useTheme()

  const locale = contextLocale || clientLocale
  const navLinks = useStableNavLinks(t)

  const activeLocale =
    LOCALES.find((loc) => loc.code === locale) || LOCALES[0]

  const handleLocaleChange = useCallback(
    (code: string) => {
      setLocale(code)
      setDropdown(null)
      if (mobileOpen) setMobileOpen(false)
    },
    [setLocale, mobileOpen]
  )

  const handleThemeToggle = useCallback(() => {
    toggleTheme()
    setDropdown(null)
  }, [toggleTheme])

  const toggleDropdown = useCallback(
    (kind: DropdownKind) => {
      setDropdown((prev) => (prev === kind ? null : kind))
    },
    []
  )

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false)
    setDropdown(null)
  }, [])

  const scrollToSection = useCallback(
    (href: string) => {
      const id = href.replace("#", "")
      const el = document.getElementById(id)
      if (!el) return

      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight

      window.scrollTo({ top, behavior: "smooth" })
    },
    [headerHeight]
  )

  const handleNavClick = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault()
      closeMobileMenu()
      scrollToSection(href)
    },
    [closeMobileMenu, scrollToSection]
  )

  // --- Scroll detection ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // --- Measure header height ---
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // --- Active section observer ---
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    navLinks.forEach((link) => {
      const el = document.getElementById(link.href.replace("#", ""))
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(link.href)
        },
        { rootMargin: "-30% 0px -60% 0px" }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [navLinks])

  // --- Body scroll lock ---
  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"
    } else {
      const scrollY = document.body.style.top
        ? -parseInt(document.body.style.top, 10)
        : 0
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      if (scrollY) window.scrollTo(0, scrollY)
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  // --- Focus first item on menu open ---
  useEffect(() => {
    if (!mobileOpen) return
    const timeout = setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([aria-label="Close menu"])'
      )
      first?.focus()
    }, 400)
    return () => clearTimeout(timeout)
  }, [mobileOpen])

  // --- Close dropdown on outside click ---
  useEffect(() => {
    if (!dropdown) return

    const handler = (e: MouseEvent) => {
      if (
        localeDropdownRef.current &&
        !localeDropdownRef.current.contains(e.target as Node)
      ) {
        setDropdown(null)
      }
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropdown])

  // --- Global keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dropdown) {
          setDropdown(null)
          localeButtonRef.current?.focus()
        } else if (mobileOpen) {
          closeMobileMenu()
          menuButtonRef.current?.focus()
        }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [dropdown, mobileOpen, closeMobileMenu])

  // --- Mobile menu keyboard trap ---
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return

    const menu = menuRef.current

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const focusables = menu.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", trap)
    return () => document.removeEventListener("keydown", trap)
  }, [mobileOpen])

  // --- Close locale dropdown on resize to desktop ---
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setDropdown(null)
    }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  const headerClass = scrolled ? "h-14" : "h-14 md:h-16"
  const menuTop = scrolled ? "top-14" : "top-14 md:top-16"

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b safe-area-top ${headerClass} ${
          scrolled
            ? "bg-[var(--landing-bg)]/85 backdrop-blur-lg border-[var(--landing-border)] shadow-xs"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full gap-2">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 select-none group"
              aria-label="Cur10usX \u2014 Go to homepage"
            >
              <Image
                src="/blacklogo.png"
                alt=""
                width={28}
                height={28}
                className="rounded-lg dark:hidden md:w-8 md:h-8 transition-transform group-hover:scale-105"
                priority
              />
              <Image
                src="/whitelogo.png"
                alt=""
                width={28}
                height={28}
                className="rounded-lg hidden dark:block md:w-8 md:h-8 transition-transform group-hover:scale-105"
                priority
              />
              <span className="font-bold text-sm tracking-tight text-[var(--landing-text-primary)] hidden sm:block">
                Cur10us<span className="text-primary">X</span>
              </span>
            </Link>

            {/* ── Desktop Navigation ────────────────────────────────────── */}
            <nav
              className="hidden md:flex items-center gap-0.5 lg:gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick(link.href)}
                    aria-current={isActive ? "true" : undefined}
                    className={`px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
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

            {/* ── Desktop Actions ───────────────────────────────────────── */}
            <div
              className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0"
              role="group"
              aria-label="Language and account"
            >
              {/* Locale */}
              <div className="relative" ref={localeDropdownRef}>
                <button
                  ref={localeButtonRef}
                  onClick={() => toggleDropdown("locale")}
                  aria-expanded={dropdown === "locale"}
                  aria-haspopup="listbox"
                  aria-label={`Language: ${activeLocale.label}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
                >
                  <Globe className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                  <span className="font-mono tracking-wider">
                    {activeLocale.short}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 opacity-50 transition-transform duration-200 ${
                      dropdown === "locale" ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  role="listbox"
                  aria-label="Select language"
                  className={`absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-lg p-1 z-50 transition-all duration-200 origin-top-right ${
                    dropdown === "locale"
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                  }`}
                >
                  {LOCALES.map((loc) => {
                    const isActive = locale === loc.code
                    return (
                      <button
                        key={loc.code}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleLocaleChange(loc.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
                        }`}
                      >
                        <span>{loc.label}</span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Divider */}
              <div
                className="w-px h-5 bg-[var(--landing-border)] mx-0.5 lg:mx-1"
                aria-hidden="true"
              />

              {/* Theme */}
              <button
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
              >
                {theme === "light" ? (
                  <Moon size={16} aria-hidden="true" />
                ) : (
                  <Sun size={16} aria-hidden="true" />
                )}
              </button>

              {/* Divider */}
              <div
                className="w-px h-5 bg-[var(--landing-border)] mx-0.5 lg:mx-1"
                aria-hidden="true"
              />

              {/* Sign in */}
              <Link
                href="/signin"
                className="text-xs lg:text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] px-2 lg:px-3 py-2 rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {t("landing.nav.signin")}
              </Link>

              {/* CTA */}
              <Link
                href="/registar-escola"
                className="text-xs lg:text-sm font-semibold text-white dark:text-zinc-900 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 px-3 lg:px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
              >
                {t("landing.nav.demo")}
              </Link>
            </div>

            {/* ── Mobile Actions ────────────────────────────────────────── */}
            <div className="flex md:hidden items-center gap-0.5">
              <button
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {theme === "light" ? (
                  <Moon size={18} aria-hidden="true" />
                ) : (
                  <Sun size={18} aria-hidden="true" />
                )}
              </button>
              <button
                ref={menuButtonRef}
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="p-2 rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-all relative z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <div className="relative w-5 h-5">
                  <X
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileOpen
                        ? "rotate-0 opacity-100 scale-100"
                        : "rotate-90 opacity-0 scale-50"
                    }`}
                    aria-hidden="true"
                  />
                  <Menu
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${
                      mobileOpen
                        ? "-rotate-90 opacity-0 scale-50"
                        : "rotate-0 opacity-100 scale-100"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className={`md:hidden fixed inset-0 z-40 ${menuTop}`}
          style={{ top: headerHeight }}
        >
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            style={{
              opacity: mobileOpen ? 1 : 0,
              willChange: "opacity",
            }}
          />

          {/* Menu panel */}
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            id="mobile-menu"
            className="relative h-full bg-[var(--landing-bg)]/98 backdrop-blur-xl border-b border-[var(--landing-border)] overflow-y-auto overscroll-contain subtle-scrollbar"
            style={{
              transform: mobileOpen ? "translateY(0)" : "translateY(-8px)",
              opacity: mobileOpen ? 1 : 0,
              transition: "transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 250ms ease-out",
              willChange: "transform, opacity",
            }}
          >
            {/* Nav links */}
            <nav className="px-4 pt-3 pb-2" aria-label="Mobile navigation">
              {navLinks.map((link, index) => {
                const isActive = activeSection === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      closeMobileMenu()
                      setTimeout(() => scrollToSection(link.href), 50)
                    }}
                    style={{
                      transitionDelay: mobileOpen ? `${index * 35}ms` : "0ms",
                    }}
                    className={`block text-[15px] font-medium transition-all duration-300 py-3 px-4 rounded-xl min-h-[44px] ${
                      mobileOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-3 opacity-0"
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
            </nav>

            {/* Divider */}
            <div
              className="h-px bg-[var(--landing-border)] mx-4"
              style={{
                transitionDelay: mobileOpen
                  ? `${navLinks.length * 35}ms`
                  : "0ms",
              }}
            />

            {/* Actions */}
            <div
              className="px-4 pt-3 pb-6 space-y-2.5"
              style={{
                transitionDelay: mobileOpen
                  ? `${navLinks.length * 35 + 50}ms`
                  : "0ms",
              }}
            >
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={closeMobileMenu}
                  className="text-center text-sm font-medium text-[var(--landing-text-primary)] py-3 px-3 rounded-xl bg-[var(--landing-bg)] border border-[var(--landing-border)] hover:bg-[var(--landing-bg-tertiary)] transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {t("landing.nav.signin")}
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="text-center text-sm font-medium text-[var(--landing-text-primary)] py-3 px-3 rounded-xl bg-[var(--landing-bg)] border border-[var(--landing-border)] hover:bg-[var(--landing-bg-tertiary)] transition-colors min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {t("landing.nav.explore")}
                </Link>
              </div>

              <Link
                href="/registar-escola"
                onClick={closeMobileMenu}
                className="block text-center text-sm font-semibold text-white dark:text-zinc-900 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-zinc-200 px-4 py-3 rounded-xl transition-all shadow-lg active:scale-[0.99] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                {t("landing.nav.demo")}
              </Link>

              {/* Locale + Theme row */}
              <div className="flex items-center gap-2 pt-1">
                {/* Mobile Locale Switcher */}
                <div className="relative flex-1" ref={localeDropdownRef}>
                  <button
                    onClick={() => toggleDropdown("locale")}
                    aria-expanded={dropdown === "locale"}
                    aria-haspopup="listbox"
                    aria-label={`Language: ${activeLocale.label}`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Globe size={15} className="opacity-60" aria-hidden="true" />
                    <span>{activeLocale.label}</span>
                    <ChevronDown
                      size={14}
                      className={`opacity-50 transition-transform duration-200 ${
                        dropdown === "locale" ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    role="listbox"
                    aria-label="Select language"
                    className={`absolute bottom-full mb-2 left-0 right-0 w-full rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-xl p-1 z-50 transition-all duration-200 origin-bottom ${
                      dropdown === "locale"
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                    }`}
                  >
                    {LOCALES.map((loc) => {
                      const isActive = locale === loc.code
                      return (
                        <button
                          key={loc.code}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => handleLocaleChange(loc.code)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer text-left min-h-[44px] ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
                          }`}
                        >
                          <span>{loc.label}</span>
                          {isActive && (
                            <Check className="w-4 h-4 text-primary" aria-hidden="true" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Theme Toggle */}
                <button
                  onClick={handleThemeToggle}
                  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  className="px-3 py-2.5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {theme === "light" ? (
                    <Moon size={16} aria-hidden="true" />
                  ) : (
                    <Sun size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})
