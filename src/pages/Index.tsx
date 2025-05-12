
import { useEffect, useState } from "react";
import AboutSection from "@/components/AboutSection";
import DemoSection from "@/components/DemoSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Reflection from "@/components/Reflection";
import WaitlistForm from "@/components/WaitlistForm";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introVisible, setIntroVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Enhanced intro animation with multiple phases
    const introPhasingTimer = setTimeout(() => {
      setAnimationPhase(1); // Subtle floating and pulsing
      
      setTimeout(() => {
        setAnimationPhase(2); // Add tagline
        
        setTimeout(() => {
          setAnimationPhase(3); // Final state before fade out
        }, 800);
      }, 1000);
    }, 500);
    
    // Hide intro animation after delay
    const introTimer = setTimeout(() => {
      setIntroVisible(false);
    }, 3800); // Extended time for smoother transition

    // Add scroll event listener for animations and progress tracking
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      
      // Handle animation triggers
      const animatedElements = document.querySelectorAll(".animate-on-scroll");
      
      animatedElements.forEach((el) => {
        const elementTop = el.getBoundingClientRect().top;
        const elementHeight = (el as HTMLElement).offsetHeight;
        const windowHeight = window.innerHeight;
        
        // If element is in viewport
        if (elementTop + elementHeight * 0.2 <= windowHeight) {
          el.classList.add("visible");
        }
      });
    };
    
    window.addEventListener("scroll", handleScroll);
    // Trigger once on initial load
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(introTimer);
      clearTimeout(introPhasingTimer);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen overflow-hidden relative">
        {/* Enhanced site intro animation */}
        {introVisible && (
          <div className="site-intro fixed inset-0 flex items-center justify-center z-50 bg-background">
            <div className={`site-intro-logo transform transition-all duration-1000 ease-in-out ${
              animationPhase >= 1 ? 'scale-110' : 'scale-100'
            }`}>
              <div className={`text-5xl md:text-7xl font-bold gradient-text mb-4 ${
                animationPhase >= 1 ? 'animate-float' : ''
              }`}>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.1s" }}>S</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.2s" }}>o</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.3s" }}>c</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.4s" }}>r</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.5s" }}>a</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.6s" }}>t</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.7s" }}>i</span>
                <span className="inline-block transform transition-all duration-500" 
                      style={{ animationDelay: "0.8s" }}>x</span>
              </div>
              <div className={`text-lg md:text-xl text-center text-muted-foreground transition-opacity duration-1000 ${
                animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
              }`}>
                Learning through discovery
              </div>
              
              {animationPhase >= 3 && (
                <div className="mt-8 flex justify-center space-x-2">
                  <span className="h-2 w-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0s" }}></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0.2s" }}></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0.4s" }}></span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Refined scroll progress indicator */}
        <div 
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-socratix-purple to-socratix-teal z-50"
          style={{ 
            width: `${scrollProgress}%`, 
            transition: 'width 0.3s ease',
            opacity: 0.9
          }}
        />
        
        {/* Subtle decorative element - more refined */}
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_70%)]"></div>
        </div>
        
        <Header />
        <Hero />
        <AboutSection />
        <HowItWorks />
        <Features />
        <DemoSection />
        <Reflection />
        <WaitlistForm />
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;
