
import { useEffect } from "react";
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
  useEffect(() => {
    // Add scroll event listener for animations
    const handleScroll = () => {
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
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen overflow-hidden">
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
