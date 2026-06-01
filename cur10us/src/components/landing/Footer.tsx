"use client"

import { Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Plataforma",
      links: [
        { label: "Funcionalidades", href: "#funcionalidades" },
        { label: "Para Escolas", href: "#para-escolas" },
        { label: "Para Estudantes", href: "#inicio" },
        { label: "Preços", href: "#precos" },
      ]
    },
    {
      title: "Recursos",
      links: [
        { label: "Blog", href: "#blog" },
        { label: "Central de Ajuda", href: "#ajuda" },
        { label: "Privacidade", href: "#privacidade" },
        { label: "Termos de Uso", href: "#termos" },
      ]
    }
  ];

  return (
    <footer className="bg-bg-brand border-t border-muted-brand/40 py-16 lg:py-20" id="blog">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

          <div className="md:col-span-4 flex flex-col items-start gap-4" id="footer-brand">
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center font-display text-2xl font-black tracking-tight text-secondary-brand">
                <span>Cur</span>
                <span className="text-primary-brand">10us</span>
                <span>X</span>
              </div>
              <span className="font-sans text-[11px] font-semibold text-secondary-brand/70 uppercase">
                Do aprendizado ao futuro.
              </span>
            </div>
            <p className="font-sans text-xs text-fg-brand/60 leading-relaxed max-w-xs">
              A principal plataforma inteligente de crescimento estudantil em África. Conectando educação, desenvolvimento pessoal e empregabilidade real.
            </p>
          </div>

          {columns.map((column, idx) => (
            <div key={idx} className="md:col-span-3">
              <h3 className="font-display text-xs font-black tracking-wider text-fg-brand/45 uppercase mb-6">
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="font-sans text-sm font-medium text-fg-brand/70 hover:text-primary-brand transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h3 className="font-display text-xs font-black tracking-wider text-fg-brand/45 uppercase mb-6">
              Siga-nos
            </h3>
            <div className="flex items-center gap-4 text-fg-brand/70">
              <a href="#instagram" className="h-[38px] w-[38px] rounded-full border border-muted-brand/60 bg-white/70 hover:bg-white hover:text-primary-brand hover:border-primary-brand/40 flex items-center justify-center transition-all cursor-pointer" aria-label="Instagram">
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a href="#linkedin" className="h-[38px] w-[38px] rounded-full border border-muted-brand/60 bg-white/70 hover:bg-white hover:text-primary-brand hover:border-primary-brand/40 flex items-center justify-center transition-all cursor-pointer" aria-label="LinkedIn">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href="#youtube" className="h-[38px] w-[38px] rounded-full border border-muted-brand/60 bg-white/70 hover:bg-white hover:text-primary-brand hover:border-primary-brand/40 flex items-center justify-center transition-all cursor-pointer" aria-label="YouTube">
                <Youtube className="h-4.5 w-4.5" />
              </a>
              <a href="#twitter" className="h-[38px] w-[38px] rounded-full border border-muted-brand/60 bg-white/70 hover:bg-white hover:text-primary-brand hover:border-primary-brand/40 flex items-center justify-center transition-all cursor-pointer" aria-label="Twitter">
                <Twitter className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-muted-brand/35 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-fg-brand/50">
          <p>&copy; {currentYear} Cur10usX. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com propósito em Luanda, Angola &#x1F1E6;&#x1F1F4;
          </p>
        </div>

      </div>
    </footer>
  );
}
