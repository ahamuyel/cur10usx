"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import { LOCALE_COOKIE } from "@/lib/i18n"
import { Globe, Check, ChevronDown, Sun, Moon } from "lucide-react"

const LOCALES = [
  { code: "pt", label: "Português", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
] as const

interface LocaleSwitcherProps {
  currentLocale: string
  theme?: string
  toggleTheme?: () => void
}

export default function LocaleSwitcher({
  currentLocale,
  theme,
  toggleTheme,
}: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const switchLocale = useCallback((code: string) => {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000`
    window.location.reload()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const activeLocale = LOCALES.find((loc) => loc.code === currentLocale) || LOCALES[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Único da Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
      >
        <Globe className="w-3.5 h-3.5 opacity-80" />
        <span className="font-mono tracking-wider">{activeLocale.short}</span>
        {theme && <><span className="text-[var(--landing-border)] font-light">|</span>
        {theme === "light" ? <Moon size={13} className="opacity-80" /> : <Sun size={13} className="opacity-80" />}</>}
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Unificado */}
      <div
        className={`absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-xl p-1 transition-all duration-200 origin-top-right z-50 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {theme !== undefined && toggleTheme !== undefined && (
          <>
            <p className="text-[9px] font-bold tracking-wider text-[var(--landing-text-dim)] uppercase px-2.5 pt-1.5 pb-1">
              Aparência
            </p>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] text-left mb-1"
            >
              <div className="flex items-center gap-2">
                {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                <span>{theme === "light" ? "Modo Escuro" : "Modo Claro"}</span>
              </div>
              <span className="text-[10px] text-[var(--landing-text-dim)] bg-[var(--landing-bg-tertiary)] px-1.5 py-0.5 rounded font-mono uppercase">
                Alt
              </span>
            </button>

            <div className="h-px bg-[var(--landing-border)] my-1 mx-1" />
          </>
        )}

        {/* SECÇÃO 2: IDIOMAS */}
        <p className="text-[9px] font-bold tracking-wider text-[var(--landing-text-dim)] uppercase px-2.5 pt-1.5 pb-1">
          Idioma
        </p>
        
        {LOCALES.map((loc) => {
          const isActive = currentLocale === loc.code
          return (
            <button
              key={loc.code}
              onClick={() => {
                switchLocale(loc.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
              }`}
            >
              <span>{loc.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}