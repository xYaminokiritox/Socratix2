
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
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
      className="relative min-h-screen flex items-center justify-center parallax-bg"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2640&q=80')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/40 to-background" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in text-white">
            Learn through questions, <br />
            <span className="gradient-text">not lectures.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Socratix is an AI tutor that adapts to your learning style, guiding you through 
            concepts with thoughtful questions rather than passive information.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button onClick={scrollToDemo} size="lg" className="w-full sm:w-auto">
              Try Demo
            </Button>
            <Button onClick={scrollToNextSection} variant="outline" size="lg" className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
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
