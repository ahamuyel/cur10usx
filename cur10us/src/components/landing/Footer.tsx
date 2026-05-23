import Link from "next/link"
import { PlatformBranding } from "@/types/landing"

export default function Footer({ branding }: { branding: PlatformBranding }) {
  return (
    <footer className="border-t border-warm-200/60 dark:border-warm-800/60 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-growth-500 to-growth-600 flex items-center justify-center shadow-lg shadow-black/10">
                <span className="text-white font-bold text-xs">CX</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-warm-900 dark:text-warm-100">Cur10us</span>
                <span className="text-growth-600 dark:text-growth-400">X</span>
              </span>
            </div>
            <p className="text-sm text-warm-500 dark:text-warm-400 leading-relaxed max-w-xs">
              {branding.description || "Plataforma de gestão escolar moderna, pensada para Angola."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-4 tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#solucao" className="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Funcionalidades</a></li>
              <li><a href="#visao" className="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Visão</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-4 tracking-wider">
              Acesso
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/signin" className="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Entrar</Link></li>
              <li><Link href="/registar-escola" className="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Registar escola</Link></li>
              <li><Link href="/aplicacao" className="text-sm text-warm-500 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Solicitar matrícula</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-4 tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-2.5 text-sm text-warm-500 dark:text-warm-400">
              <li className="hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">{branding.contactEmail || "suporte@cur10usx.com"}</li>
              {branding.contactPhone && <li className="hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">{branding.contactPhone}</li>}
              <li>Luanda, Angola</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-warm-200/60 dark:border-warm-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-400 dark:text-warm-500">
            &copy; {new Date().getFullYear()} {branding.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-warm-400 dark:text-warm-500">
            <Link href="/termos" className="hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-warm-900 dark:hover:text-warm-100 transition-colors duration-200">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
