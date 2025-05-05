
import { useEffect, useRef } from "react";

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const animatedElements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    animatedElements?.forEach((el) => observer.observe(el));
    
    return () => {
      animatedElements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      {/* Improved subtle background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-30"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundSize: '30px 30px',
            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.2) 1px, transparent 1px)'
          }}></div>
        </div>
        
        {/* Soft accent circles - reduced number and subtlety */}
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(139, 92, 246, 0.03)' : 
                i % 3 === 1 ? 'rgba(14, 165, 233, 0.02)' : 
                'rgba(217, 70, 239, 0.03)'
              }, transparent 70%)`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block animate-on-scroll">
            <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              About Us
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-8 animate-on-scroll relative inline-block">
            What is <span className="animated-gradient-text">Socratix</span>?
            <span className="absolute -z-10 inset-0 bg-primary/5 blur-3xl rounded-full"></span>
          </h2>
          
          <div className="glass-card p-8 md:p-12 animate-on-scroll advanced-card" style={{ transitionDelay: "0.2s" }}>
            <p className="text-xl md:text-3xl font-medium mb-6 font-display">
              An AI tutor that teaches by asking, not telling.
            </p>
            <p className="text-base md:text-lg text-muted-foreground">
              Socratix uses the Socratic method—teaching through thoughtful questioning—to 
              create deeper understanding and develop critical thinking skills. 
              Instead of passive learning, our AI guides you to discover knowledge 
              through your own insights.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 animate-on-scroll relative group hover:scale-105 transition-transform duration-300" style={{ transitionDelay: "0.3s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-socratix-purple/0 via-socratix-purple/5 to-socratix-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-inner-glow">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Active Learning</h3>
              <p className="text-sm text-muted-foreground">
                Engage with concepts through dialogue rather than passive consumption.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-on-scroll relative group hover:scale-105 transition-transform duration-300" style={{ transitionDelay: "0.4s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-socratix-teal/0 via-socratix-teal/5 to-socratix-teal/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-inner-glow">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Critical Thinking</h3>
              <p className="text-sm text-muted-foreground">
                Develop reasoning skills by examining assumptions and forming conclusions.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-on-scroll relative group hover:scale-105 transition-transform duration-300" style={{ transitionDelay: "0.5s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-socratix-pink/0 via-socratix-pink/5 to-socratix-pink/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-inner-glow">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Dialogue</h3>
              <p className="text-sm text-muted-foreground">
                AI adapts to your responses, creating a customized learning experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
