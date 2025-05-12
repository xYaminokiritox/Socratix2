
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

  useEffect(() => {
    // Hide intro animation after delay
    const introTimer = setTimeout(() => {
      setIntroVisible(false);
    }, 3000); // Extended time for smoother transition

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
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen overflow-hidden relative">
        {/* Enhanced site intro animation */}
        {introVisible && (
          <div className="site-intro fixed inset-0 flex items-center justify-center z-50 bg-background">
            <div className="site-intro-logo transform transition-all duration-1000 ease-in-out animate-pulse">
              <div className="text-4xl md:text-6xl font-bold gradient-text mb-4 animate-float">Socratix</div>
              <div className="text-lg text-muted-foreground transition-opacity duration-1000 delay-500 opacity-0 animate-fade-in">
                Learning through discovery
              </div>
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
