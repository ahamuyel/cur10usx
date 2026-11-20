"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "@/lib/i18n"
import type { PlatformBranding } from "@/types/landing"

type FooterProps = {
  branding?: PlatformBranding
}

export default function Footer({ branding }: FooterProps) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const brandName = branding?.name || "Cur10usX"
  const contactEmail = branding?.contactEmail || t("landing.footer.contact")

  return (
    <footer className="bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 select-none">
              <Image
                src="/blacklogo.png"
                alt={brandName}
                width={28}
                height={28}
                className="h-7 w-auto rounded-lg dark:hidden"
              />
              <Image
                src="/whitelogo.png"
                alt={brandName}
                width={28}
                height={28}
                className="h-7 w-auto rounded-lg hidden dark:block"
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

            <p className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed max-w-xs">
              {t("landing.footer.description")}
            </p>

            <div>
              <a
                href={`mailto:${contactEmail}`}
                className="text-xs font-normal text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="lg:col-span-3 space-y-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--landing-text-muted)] block">
              {t("landing.footer.product")}
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.link_product")}
                </Link>
              </li>
              <li>
                <Link
                  href="/para-escolas"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.nav.institutions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/para-estudantes"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.nav.students")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.nav.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--landing-text-muted)] block">
              {t("landing.footer.resources")}
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/#ecossistema"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.ecosystem.tag")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#experiencia"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.experience.tag")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#perfil-evolutivo"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.evolution.tag")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.link_faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Legal Column */}
          <div className="lg:col-span-3 space-y-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--landing-text-muted)] block">
              {t("landing.footer.company")}
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/registar-escola"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.link_register")}
                </Link>
              </li>
              <li>
                <Link
                  href="/aplicacao"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.link_apply")}
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.link_signin")}
                </Link>
              </li>
              <li className="pt-1 flex items-center gap-3">
                <Link
                  href="/termos"
                  className="text-xs font-light text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.tos")}
                </Link>
                <span className="text-[var(--landing-border-strong)]" aria-hidden="true">·</span>
                <Link
                  href="/privacidade"
                  className="text-xs font-light text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors"
                >
                  {t("landing.footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--landing-border)] py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-light text-[var(--landing-text-muted)] text-center sm:text-left">
            &copy; {year} {t("landing.footer.copyright")}
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-light text-[var(--landing-text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{t("landing.footer.status")}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
