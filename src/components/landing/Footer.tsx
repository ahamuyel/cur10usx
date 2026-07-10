"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6">
          <span className="text-[11px] md:text-xs text-[var(--landing-text-dim)]">
            &copy; {year} {t("landing.footer.copyright")}
          </span>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/termos"
              className="text-[11px] md:text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors py-1"
            >
              {t("landing.footer.tos")}
            </Link>
            <Link
              href="/privacidade"
              className="text-[11px] md:text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors py-1"
            >
              {t("landing.footer.privacy")}
            </Link>
            <a
              href={`mailto:${t("landing.footer.email")}`}
              className="text-[11px] md:text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors py-1"
            >
              {t("landing.footer.email")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
