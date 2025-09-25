"use client";
import Link from "next/link";

// Componente Logo
const Logo = () => (
  <Link href="/" className="inline-block logo-text">
    <img
      src="logo.png"
      alt="Logo da Cur10usX"
      className="w-auto h-8 md:h-10 object-contain transition-all duration-300 hover:scale-105"
    />
  </Link>
);

export default Logo;