"use client"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Sun, Moon, Globe, Check, ChevronDown, ArrowRight } from "lucide-react"
import { useTheme } from "@/provider/theme"
import { useLocale, useSetLocale } from "@/provider/locale"
import type { PlatformBranding } from "@/types/landing"
import { useTranslation } from "@/lib/i18n"

const LOCALES = [
  { code: "pt", label: "Português", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
] as const

const NAV_ITEMS = [
  { key: "product", href: "#produto" },
  { key: "institutions", href: "#ecossistema" },
  { key: "features", href: "#experiencia" },
  { key: "students", href: "#perfil-evolutivo" },
] as const

export default memo(function LandingNavbar({
  branding,
}: {
  branding: PlatformBranding
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [localeOpen, setLocaleOpen] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const desktopLocaleRef = useRef<HTMLDivElement>(null)
  const mobileLocaleRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(64)

  const { t, locale: clientLocale } = useTranslation()
  const contextLocale = useLocale()
  const setLocale = useSetLocale()
  const { theme, toggleTheme } = useTheme()

  const locale = contextLocale || clientLocale
  const activeLocale = LOCALES.find((l) => l.code === locale) || LOCALES[0]
  const brandName = branding?.name || "Cur10usX"

  const navLinks = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        label: t(`landing.nav.${item.key}`),
        href: item.href,
      })),
    [t]
  )

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    setLocaleOpen(false)
  }, [])

  const scrollToSection = useCallback(
    (href: string) => {
      const id = href.replace("#", "")
      const el = document.getElementById(id)
      if (!el) return
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" })
    },
    [headerHeight]
  )

  const handleNavClick = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault()
      closeMobile()
      scrollToSection(href)
    },
    [closeMobile, scrollToSection]
  )

  const handleLocaleSelect = useCallback(
    (code: string) => {
      setLocale(code)
      setLocaleOpen(false)
      if (mobileOpen) setMobileOpen(false)
    },
    [setLocale, mobileOpen]
  )

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Measure header height
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Active section highlight
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    navLinks.forEach((link) => {
      const el = document.getElementById(link.href.replace("#", ""))
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(link.href)
        },
        { rootMargin: "-25% 0px -65% 0px" }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [navLinks])

  // Close locale dropdown on outside click
  useEffect(() => {
    if (!localeOpen) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      const insideDesktop = desktopLocaleRef.current?.contains(target)
      const insideMobile = mobileLocaleRef.current?.contains(target)
      if (!insideDesktop && !insideMobile) setLocaleOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [localeOpen])

  // Escape key & focus management
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (localeOpen) {
          setLocaleOpen(false)
        } else if (mobileOpen) {
          closeMobile()
          menuButtonRef.current?.focus()
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [localeOpen, mobileOpen, closeMobile])

  // Body scroll lock & focus trap on mobile drawer
  useEffect(() => {
    if (!mobileOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const menuEl = mobileMenuRef.current
    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !menuEl) return
      const focusables = menuEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

    document.addEventListener("keydown", onTrap)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onTrap)
    }
  }, [mobileOpen])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 inset-x-0 z-50 h-16 transition-colors duration-200 safe-area-top border-b ${
          scrolled || mobileOpen
            ? "bg-[var(--landing-bg)]/85 backdrop-blur-md border-[var(--landing-border)]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] rounded-lg"
            aria-label={`${brandName} — Home`}
          >
            <Image
              src="/blacklogo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto rounded-lg dark:hidden transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <Image
              src="/whitelogo.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto rounded-lg hidden dark:block transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span className="text-[15px] font-medium tracking-tight text-[var(--landing-text-primary)]">
              {brandName === "Cur10usX" ? (
                <>
                  Cur10us<span className="text-[var(--landing-accent)]">X</span>
                </>
              ) : (
                brandName
              )}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
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
                  className={`px-3 py-1.5 text-[13px] font-normal rounded-lg transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] ${
                    isActive
                      ? "text-[var(--landing-text-primary)] bg-[var(--landing-bg-tertiary)] font-medium"
                      : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]/60"
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {/* Locale Switcher */}
            <div className="relative" ref={desktopLocaleRef}>
              <button
                type="button"
                onClick={() => setLocaleOpen((o) => !o)}
                aria-expanded={localeOpen}
                aria-haspopup="listbox"
                aria-label={`Language: ${activeLocale.label}`}
                className="inline-flex items-center gap-1.5 px-2.5 h-9 text-xs font-normal rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="font-mono text-[11px]">{activeLocale.short}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-150 ${localeOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {localeOpen && (
                <div
                  role="listbox"
                  aria-label="Select language"
                  className="absolute right-0 mt-1.5 w-40 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] shadow-lg p-1 z-50"
                >
                  {LOCALES.map((loc) => {
                    const selected = locale === loc.code
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => handleLocaleSelect(loc.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          selected
                            ? "bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] font-medium"
                            : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
                        }`}
                      >
                        <span>{loc.label}</span>
                        {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("landing.nav.theme_toggle")}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <div className="w-px h-4 bg-[var(--landing-border)] mx-1" aria-hidden="true" />

            {/* Login */}
            <Link
              href="/signin"
              className="px-3 h-9 inline-flex items-center text-[13px] font-normal text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              {t("landing.nav.signin")}
            </Link>

            {/* Primary CTA */}
            <Link
              href="/registar-escola"
              className="group inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-medium bg-[var(--landing-text-primary)] text-[var(--landing-bg)] hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)]"
            >
              <span>{t("landing.nav.demo")}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile / Tablet Controls */}
          <div className="flex lg:hidden items-center gap-1">
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center px-3 h-9 text-xs font-normal text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] rounded-lg hover:bg-[var(--landing-bg-tertiary)] transition-colors"
            >
              {t("landing.nav.signin")}
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={t("landing.nav.theme_toggle")}
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="w-[18px] h-[18px]" aria-hidden="true" />
              ) : (
                <Sun className="w-[18px] h-[18px]" aria-hidden="true" />
              )}
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? t("landing.nav.menu_close") : t("landing.nav.menu_open")}
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-menu"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40"
          style={{ top: headerHeight }}
        >
          <div
            aria-hidden="true"
            onClick={closeMobile}
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
          />
          <div
            ref={mobileMenuRef}
            id="landing-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="relative max-h-full overflow-y-auto bg-[var(--landing-bg)] border-b border-[var(--landing-border)] px-4 pt-4 pb-6 shadow-xl"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation links">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick(link.href)}
                    className={`min-h-[44px] flex items-center px-3.5 rounded-xl text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--landing-bg-tertiary)] text-[var(--landing-text-primary)] font-medium"
                        : "text-[var(--landing-text-secondary)] hover:bg-[var(--landing-bg-tertiary)]/70 hover:text-[var(--landing-text-primary)]"
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>

            <div className="my-4 h-px bg-[var(--landing-border)]" />

            <div className="flex flex-col gap-2.5">
              <Link
                href="/registar-escola"
                onClick={closeMobile}
                className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium bg-[var(--landing-text-primary)] text-[var(--landing-bg)] hover:opacity-90 transition-opacity"
              >
                <span>{t("landing.nav.demo")}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={closeMobile}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-sm font-normal text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors"
                >
                  {t("landing.nav.signin")}
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobile}
                  className="min-h-[44px] inline-flex items-center justify-center rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-sm font-normal text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors"
                >
                  {t("landing.nav.explore")}
                </Link>
              </div>

              {/* Mobile Locale Switcher */}
              <div className="relative pt-1" ref={mobileLocaleRef}>
                <button
                  type="button"
                  onClick={() => setLocaleOpen((o) => !o)}
                  aria-expanded={localeOpen}
                  aria-haspopup="listbox"
                  className="min-h-[44px] w-full inline-flex items-center justify-between px-3.5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs text-[var(--landing-text-secondary)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Globe className="w-4 h-4" aria-hidden="true" />
                    {activeLocale.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 ${localeOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {localeOpen && (
                  <div
                    role="listbox"
                    className="mt-1.5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-1 shadow-lg"
                  >
                    {LOCALES.map((loc) => {
                      const selected = locale === loc.code
                      return (
                        <button
                          key={loc.code}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => handleLocaleSelect(loc.code)}
                          className={`min-h-[44px] w-full flex items-center justify-between px-3 text-xs rounded-lg transition-colors text-left ${
                            selected
                              ? "bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] font-medium"
                              : "text-[var(--landing-text-secondary)] hover:bg-[var(--landing-bg-tertiary)]"
                          }`}
                        >
                          <span>{loc.label}</span>
                          {selected && <Check className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})
