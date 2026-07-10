"use client"

import { useCallback, useState, useRef, useEffect } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useLocale, useSetLocale } from "@/provider/locale"

const LOCALES = [
  { code: "pt", label: "Portugu\u00eas", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Fran\u00e7ais", short: "FR" },
] as const

interface LocaleSwitcherProps {
  currentLocale: string
}

export default function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const contextLocale = useLocale()
  const setLocale = useSetLocale()
  const activeLocaleCode = contextLocale || currentLocale

  const switchLocale = useCallback(
    (code: string) => {
      setLocale(code)
      setIsOpen(false)
    },
    [setLocale]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const activeLocale = LOCALES.find((loc) => loc.code === activeLocaleCode) || LOCALES[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Language: ${activeLocale.label}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)] transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
      >
        <Globe className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        <span className="font-mono tracking-wider">{activeLocale.short}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        role="listbox"
        aria-label="Select language"
        className={`absolute right-0 mt-1.5 w-44 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-lg p-1 transition-all duration-200 origin-top-right z-50 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {LOCALES.map((loc) => {
          const isActive = activeLocaleCode === loc.code
          return (
            <button
              key={loc.code}
              role="option"
              aria-selected={isActive}
              onClick={() => switchLocale(loc.code)}
              className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-bg-tertiary)]"
              }`}
            >
              <span>{loc.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
