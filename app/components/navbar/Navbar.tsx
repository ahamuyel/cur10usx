"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import CTAButton from "./CTAButton";
import "../styles.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="py-4 px-6 bg-gradient-to-r from-primary to-primary-dark shadow-md sticky top-0 z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Logo />
        <NavLinks isMobile={false} />
        <CTAButton className="hidden md:block" />
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </nav>
      <MobileMenu isOpen={isOpen} toggleMenu={toggleMenu} />
    </div>
  );
};


export default Navbar;