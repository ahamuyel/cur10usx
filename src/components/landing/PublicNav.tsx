"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import LocaleSwitcher from "./LocaleSwitcher"

export default function PublicNav() {
  const { t, locale } = useTranslation()
  return (
    <div className="flex items-center gap-3">
      <LocaleSwitcher currentLocale={locale} />
      <Link
        href="/signin"
        className="hidden sm:inline-flex text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
      >
        {t("auth.login")}
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary-700 transition shadow-sm"
      >
        {t("auth.signup")}
      </Link>
    </div>
  )
}
