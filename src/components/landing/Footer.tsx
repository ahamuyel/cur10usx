"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import Image from "next/image"

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/blacklogo.png"
                alt="Cur10usX"
                width={28}
                height={28}
                className="rounded-lg dark:hidden md:w-8 md:h-8"
              />
              <Image
                src="/whitelogo.png"
                alt="Cur10usX"
                width={28}
                height={28}
                className="rounded-lg hidden dark:block md:w-8 md:h-8"
              />
              <span className="font-bold text-sm text-[var(--landing-text-primary)]">
                Cur10usX
              </span>
            </div>
            <p className="text-xs text-[var(--landing-text-dim)] leading-relaxed max-w-xs mb-4">
              {t("landing.footer.description")}
            </p>
            <a
              href="mailto:suporte@cur10usx.com"
              className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors"
            >
              suporte@cur10usx.com
            </a>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <span className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest font-semibold">
              {t("landing.footer.product")}
            </span>
            <ul className="space-y-2.5">
              {["Alunos", "Professores", "Presenças", "Avaliações", "Relatórios"].map((label) => (
                <li key={label}>
                  <a href="#ecosystem" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <span className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest font-semibold">
              {t("landing.footer.resources")}
            </span>
            <ul className="space-y-2.5">
              <li><a href="#transformation" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">Transformação</a></li>
              <li><a href="#benefits" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">Benefícios</a></li>
              <li><a href="#vision" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">Visão</a></li>
              <li><a href="#trust" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">Infraestrutura</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <span className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest font-semibold">
              {t("landing.footer.company")}
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link href="/termos" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">
                  {t("landing.footer.tos")}
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-xs text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors">
                  {t("landing.footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[var(--landing-border)] py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--landing-text-dim)] text-center sm:text-left">
            &copy; {year} {t("landing.footer.copyright")}
          </p>
          <div className="flex items-center gap-2 text-xs text-[var(--landing-text-dim)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("landing.footer.status")}
          </div>
        </div>
      </div>
    </footer>
  )
}
