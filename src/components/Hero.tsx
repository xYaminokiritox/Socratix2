
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mouseMoveX, setMouseMoveX] = useState(0);
  const [mouseMoveY, setMouseMoveY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (heroRef.current) {
        // Parallax effect on hero background
        heroRef.current.style.backgroundPositionY = `${scrollY * 0.5}px`;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (heroRef.current) {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      setMouseMoveX(x);
      setMouseMoveY(y);
    }
  };

  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToNextSection = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center parallax-bg overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2640&q=80')"
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-40 h-40 bg-socratix-purple/30 rounded-full filter blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-socratix-teal/30 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      <div className="container px-4 relative z-10">
        <div 
          className="max-w-3xl mx-auto text-center"
          style={{ 
            transform: `translate(${mouseMoveX * 0.5}px, ${mouseMoveY * 0.5}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in text-white">
            Learn through questions, <br />
            <span className="animated-gradient-text">not lectures.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Socratix is an AI tutor that adapts to your learning style, guiding you through 
            concepts with thoughtful questions rather than passive information.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button onClick={scrollToDemo} size="lg" className="w-full sm:w-auto glow-effect group relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-socratix-purple to-socratix-teal opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              Try Demo
            </Button>
            <Button onClick={scrollToNextSection} variant="outline" size="lg" className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <button 
          onClick={scrollToNextSection}
          className="scroll-down-indicator text-white/70 hover:text-white transition-colors"
          aria-label="Scroll down"
        >
          <ArrowDown size={28} />
        </button>
      </div>
    </div>
  );
};

export default Hero;
