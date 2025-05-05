
import { useEffect, useRef } from "react";

const HowItWorks = () => {
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

  const steps = [
    {
      number: "01",
      title: "Choose a topic or upload notes",
      description:
        "Select from our library of subjects or upload your own study materials to begin your learning journey.",
      icon: (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI asks Socratic questions",
      description:
        "Socratix guides your learning with thoughtful questions that encourage critical thinking and deeper understanding.",
      icon: (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Adaptive answers and real-time feedback",
      description:
        "The AI responds to your answers intelligently, providing customized feedback and guidance based on your understanding.",
      icon: (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      number: "04",
      title: "Flashcards and quizzes for retention",
      description:
        "Automatically generated study materials help reinforce learning and improve long-term retention of key concepts.",
      icon: (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      number: "05",
      title: "Earn points, badges, and track progress",
      description:
        "Gamified elements keep you motivated while detailed analytics help you track your learning journey and identify areas for improvement.",
      icon: (
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 md:py-32 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-on-scroll">
            How <span className="gradient-text">Socratix</span> Works
          </h2>

          <div className="relative">
            {/* Vertical line connecting steps */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-border md:block hidden" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex flex-col md:flex-row mb-12 animate-on-scroll"
                style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex-shrink-0 flex md:flex-col items-center mb-4 md:mb-0">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-background flex items-center justify-center border border-border z-10">
                    {step.icon}
                  </div>
                  <div className="ml-4 md:ml-0 md:mt-4 font-bold text-muted-foreground">{step.number}</div>
                </div>
                <div className="md:ml-8 glass-card p-6 md:p-8 flex-1">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
