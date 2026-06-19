"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

type LocaleContextValue = {
  locale: string
  setLocale: (locale: string) => void
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "pt",
  setLocale: () => {},
})

export const LOCALE_COOKIE = "cur10usx_locale"

export function LocaleProvider({
  locale: initialLocale,
  children,
}: {
  locale: string
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  useEffect(() => {
    setLocaleState(initialLocale)
  }, [initialLocale])

  const setLocale = useCallback((newLocale: string) => {
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=31536000`
    setLocaleState(newLocale)
  }, [])

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  return context.locale || "pt"
}

export function useSetLocale() {
  const context = useContext(LocaleContext)
  return context.setLocale
}
