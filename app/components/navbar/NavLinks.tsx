import Link from "next/link";

interface NavLinksProps {
  isMobile: boolean;
}

// Componente NavLinks
const NavLinks: React.FC<NavLinksProps> = ({ isMobile }) => {
  const links = [
    { href: "#about", label: "Sobre Nós" },
    { href: "#services", label: "Serviços" },
    { href: "#products", label: "Produtos" },
    { href: "#pricing", label: "Preços" },
    { href: "#blog", label: "Blog" },
  ];

  return (
    <div
      className={`${
        isMobile ? "flex flex-col items-center gap-4" : "hidden md:flex items-center gap-8"
      } text-base font-medium`}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href} 
          className="text-text hover:text-accent transition-colors nav-link"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks