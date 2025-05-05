
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
    <section id="about" ref={sectionRef} className="py-20 md:py-32 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-on-scroll">
            What is <span className="gradient-text">Socratix</span>?
          </h2>
          
          <div className="glass-card p-8 md:p-12 animate-on-scroll" style={{ transitionDelay: "0.2s" }}>
            <p className="text-xl md:text-2xl font-medium mb-6">
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
            <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: "0.3s" }}>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Active Learning</h3>
              <p className="text-sm text-muted-foreground">
                Engage with concepts through dialogue rather than passive consumption.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Critical Thinking</h3>
              <p className="text-sm text-muted-foreground">
                Develop reasoning skills by examining assumptions and forming conclusions.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: "0.5s" }}>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
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
