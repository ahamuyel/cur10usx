
import NavLinks from "./NavLinks";
import CTAButton from "./CTAButton";
interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

// Componente MobileMenu
const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleMenu }) => (
  <>
    {isOpen && (
      <div className=" grid gap-5 justify-center md:hidden py-4 mobile-menu">
        <NavLinks isMobile={true} />
        <CTAButton onClick={toggleMenu} />
      </div>
    )}
  </>
);

export default MobileMenu