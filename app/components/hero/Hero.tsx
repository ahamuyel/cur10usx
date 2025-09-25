"use client";
import Link from "next/link";
import "../styles.css";

// Interfaces para TypeScript
interface HeroProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

const Hero = ({ title = "Transforme Seu Negócio com Tecnologia", description = "A Cur10usX oferece soluções digitais acessíveis para PMEs angolanas, conectando tradição e inovação.", ctaText = "Começar Agora", ctaHref = "#contact" }: HeroProps) => {
  return (
    <section className="py-16 px-6 bg-gradient-to-r from-primary to-primary-dark text-text">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="text-center md:text-left">
          <HeroTitle title={title} />
          <HeroText description={description} />
          <HeroCTA ctaText={ctaText} ctaHref={ctaHref} />
        </div>
        <div>
          <HeroGraphic />
          {/* <HeroGraphic /> */}
        </div>
      </div>
    </section>
  );
};

// Componente HeroTitle
const HeroTitle: React.FC<{ title: string }> = ({ title }) => (
  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-accent hero-title">
    {title}
  </h1>
);

// Componente HeroText
const HeroText: React.FC<{ description: string }> = ({ description }) => (
  <p className="text-lg md:text-xl mb-6 max-w-lg hero-text">
    {description}
  </p>
);

// Componente HeroCTA
const HeroCTA: React.FC<{ ctaText: string; ctaHref: string }> = ({ ctaText, ctaHref }) => (
  <Link
    href={ctaHref}
    className="inline-block bg-accent text-secondary px-6 py-3 rounded-md font-semibold hover:bg-accent-dark transition-colors cta-button"
  >
    {ctaText}
  </Link>
);

// Componente HeroGraphic (novo design mais interessante)
const HeroGraphic = () => (
  <div className="w-64 h-64 relative hero-graphic">
    {/* Linha principal conectando pontos */}
    <div className="absolute w-full h-px bg-accent-dark top-1/2 left-0 transform -translate-y-1/2 animate-slide"></div>
    {/* Pontos animados (negócios conectados) */}
    <div className="absolute w-4 h-4 bg-accent rounded-full top-1/4 left-1/4 animate-fade-in"></div>
    <div className="absolute w-4 h-4 bg-accent rounded-full top-3/4 right-1/4 animate-fade-in delay-200"></div>
    <div className="absolute w-4 h-4 bg-accent-dark rounded-full top-1/2 left-1/2 animate-pulse"></div>
    {/* Padrão geométrico inspirado em arte africana - vamos melhorar depois*/}
    <div className="absolute w-8 h-8 border-2 border-accent top-1/3 left-1/3 transform rotate-45 animate-rotate-slow"></div>
    <div className="absolute w-12 h-12 border-2 border-accent-dark top-2/3 right-1/3 transform -rotate-45 animate-rotate-slow delay-100"></div>
  </div>
);

export default Hero;