"use client"

import Link from "next/link"
import { useSchoolBranding } from "@/provider/school-branding"
import { useTranslation } from "@/lib/i18n"

export default function DashboardFooter() {
  const { footerText, contactEmail } = useSchoolBranding()
  const { tUI } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Copyright */}
          <div className="text-[11px] text-muted-foreground text-center sm:text-left">
            {footerText ? (
              <span>{footerText}</span>
            ) : (
              <span>&copy; {year} Cur10usX. {tUI("Todos os direitos reservados.")}</span>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Link
              href="/termos"
              className="hover:text-foreground transition"
            >
              {tUI("Termos")}
            </Link>
            <span className="text-border">&middot;</span>
            <Link
              href="/privacidade"
              className="hover:text-foreground transition"
            >
              {tUI("Privacidade")}
            </Link>
            {contactEmail && (
              <>
                <span className="text-border">&middot;</span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-foreground transition"
                >
                  {contactEmail}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
