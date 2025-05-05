
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mouseMoveX, setMouseMoveX] = useState(0);
  const [mouseMoveY, setMouseMoveY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);
      
      if (heroRef.current) {
        // Base parallax effect for the hero section
        heroRef.current.style.backgroundPositionY = `${newScrollY * 0.5}px`;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse parallax effect with multiple layers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    setMouseMoveX(x);
    setMouseMoveY(y);
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

  // Calculate parallax positions for different layers
  const layer1Y = scrollY * 0.1;  // Slowest (furthest)
  const layer2Y = scrollY * 0.2;  // Medium
  const layer3Y = scrollY * 0.4;  // Fastest (closest)

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2640&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated parallax layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Layer 1 - Far background */}
        <div 
          className="parallax-layer parallax-layer-1"
          style={{ transform: `translateY(${layer1Y}px)` }}
        >
          <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full bg-purple-900/10 filter blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-teal-800/10 filter blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-indigo-900/10 filter blur-3xl" />
        </div>
        
        {/* Layer 2 - Middle elements */}
        <div 
          className="parallax-layer parallax-layer-2"
          style={{ transform: `translateY(${layer2Y}px)` }}
        >
          <div className="absolute top-1/4 -left-20 w-40 h-40 bg-socratix-purple/30 rounded-full filter blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-socratix-teal/30 rounded-full filter blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundSize: '50px 50px',
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              transform: `translateX(${mouseMoveX * 0.05}px) translateY(${mouseMoveY * 0.05}px)`
            }}></div>
          </div>
          
          {/* Floating elements */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/5 animate-float-subtle"
              style={{
                width: `${Math.random() * 8 + 2}px`,
                height: `${Math.random() * 8 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 8 + 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Layer 3 - Foreground elements */}
        <div 
          className="parallax-layer parallax-layer-3"
          style={{ transform: `translateY(${layer3Y}px)` }}
        >
          {/* Morphing blobs */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-socratix-purple/5 morphing-blob" 
               style={{animationDelay: "0s"}} />
          <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-socratix-teal/5 morphing-blob" 
               style={{animationDelay: "2s"}} />
               
          {/* Animated light streaks */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={`streak-${i}`}
              className="absolute h-[1px] bg-white/10 shimmer"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/20 to-background" />
      
      <div className="container px-4 relative z-10">
        <div 
          className="max-w-3xl mx-auto text-center"
          style={{ 
            transform: `translate(${mouseMoveX * 0.5}px, ${mouseMoveY * 0.5}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          {/* Socratix Logo/Identity */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg socratix-logo-gradient p-[2px] shadow-glow">
                <div className="w-full h-full bg-background dark:bg-card rounded-[6px] flex items-center justify-center">
                  <span className="text-2xl font-bold font-display text-transparent bg-clip-text socratix-logo-gradient">S</span>
                </div>
              </div>
              <span className="text-3xl font-bold font-display text-white">Socratix</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in text-white">
            Learn through questions, <br />
            <span className="animated-gradient-text">not lectures.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Socratix is an AI tutor that adapts to your learning style, guiding you through 
            concepts with thoughtful questions rather than passive information.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              onClick={scrollToDemo} 
              size="lg" 
              className="w-full sm:w-auto btn-primary group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-socratix-purple to-socratix-teal opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <span className="relative z-10">Try Demo</span>
            </Button>
            <Button 
              onClick={scrollToNextSection} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-soft hover:-translate-y-0.5"
            >
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
