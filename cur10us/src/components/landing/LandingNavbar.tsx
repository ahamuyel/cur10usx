"use client"

import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Impacto", href: "#impacto" },
    { label: "Para Escolas", href: "#para-escolas" },
    { label: "Blog", href: "#blog" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-muted-brand/40 bg-bg-brand/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#inicio" className="group flex flex-col items-start gap-0.5" id="logo-brand">
          <div className="flex items-center font-display text-2xl font-extrabold tracking-tight">
            <span className="text-secondary-brand">Cur</span>
            <span className="text-primary-brand">10us</span>
            <span className="text-secondary-brand">X</span>
          </div>
          <span className="font-sans text-[10px] font-medium tracking-wider text-secondary-brand/80 uppercase">
            Do aprendizado ao futuro.
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-sm font-medium text-fg-brand/70 hover:text-primary-brand transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <a
            href="#entrar"
            className="font-sans text-sm font-semibold text-fg-brand/80 hover:text-primary-brand transition-colors"
          >
            Entrar
          </a>
          <motion.a
            href="#criar-conta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-primary-brand px-5 py-2 font-sans text-sm font-semibold text-white shadow-sm hover:bg-primary-brand/90 transition-all cursor-pointer"
          >
            Criar Conta
          </motion.a>
        </div>

        <button
          className="lg:hidden p-1.5 text-fg-brand hover:text-primary-brand transition-colors focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden absolute top-[100%] left-0 w-full border-b border-muted-brand/40 bg-bg-brand p-6 shadow-xl flex flex-col gap-5 z-40"
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-sans text-base font-medium text-fg-brand/80 hover:text-primary-brand"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <hr className="border-muted-brand/40" />
          <div className="flex items-center justify-between">
            <a
              href="#entrar"
              onClick={() => setIsOpen(false)}
              className="font-sans text-base font-semibold text-fg-brand/85 hover:text-primary-brand"
            >
              Entrar
            </a>
            <a
              href="#criar-conta"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-primary-brand px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-sm text-center"
            >
              Criar Conta
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
}
