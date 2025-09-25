import Link from "next/link";


interface CTAButtonProps {
  className?: string;
  onClick?: () => void;
}

// Componente CTAButton
const CTAButton: React.FC<CTAButtonProps> = ({ className = "", onClick }) => (
  <Link
    href="#contact"
    className={`${className} text-text px-4 py-2 rounded-md font-semibold hover:bg-accent-dark transition-colors cta-button`}
    onClick={onClick}
  >
    Solicitar Orçamento
  </Link>
);

export default CTAButton