import Link from "next/link";

const CTAButton = ({ className = "", onClick }) => (
  <Link
    href="#contact"
    className={`${className} bg-accent text-secondary px-4 py-2 rounded-md font-semibold hover:bg-accent-dark transition-colors cta-button`}
    onClick={onClick}
  >
    Solicitar Orçamento
  </Link>
);

export default CTAButton