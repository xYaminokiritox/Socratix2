
import { useEffect, useRef } from "react";

const Reflection = () => {
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
    <section id="reflection" ref={sectionRef} className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-on-scroll">
            Reflection & <span className="gradient-text">Continuation</span>
          </h2>

          <div className="glass-card p-8 md:p-12 mb-12 animate-on-scroll" style={{ transitionDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Post-Session Insights</h3>
                <p className="text-muted-foreground mb-4">
                  After each learning session, Socratix provides you with personalized insights:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Key concepts you've mastered</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Areas that need more attention</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Reasoning patterns and thinking habits</span>
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">Personalized Next Steps</h3>
                <p className="text-muted-foreground mb-4">
                  Socratix designs your future learning path based on your performance:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>Suggested topics to explore next</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>Recommended practice exercises</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    <span>Long-term learning goals and milestones</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: "0.3s" }}>
              <div className="mb-4 text-2xl text-center">✨</div>
              <h3 className="text-lg font-semibold mb-3 text-center">Track Your Growth</h3>
              <p className="text-muted-foreground text-sm text-center">
                Visualize your learning journey with interactive progress dashboards and achievement records.
              </p>
            </div>
            <div className="glass-card p-6 animate-on-scroll" style={{ transitionDelay: "0.4s" }}>
              <div className="mb-4 text-2xl text-center">🧠</div>
              <h3 className="text-lg font-semibold mb-3 text-center">Spaced Repetition</h3>
              <p className="text-muted-foreground text-sm text-center">
                Socratix intelligently schedules review sessions to maximize knowledge retention over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reflection;
