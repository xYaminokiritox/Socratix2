
import { useEffect, useRef } from "react";

const Features = () => {
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

  const features = [
    {
      title: "AI Socratic Dialogue",
      description: "Engage in meaningful conversations with AI that challenges your thinking through the Socratic method.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: "from-socratix-purple/20 to-transparent",
      hoverColor: "group-hover:from-socratix-purple/30",
    },
    {
      title: "Personalized Learning Paths",
      description: "AI adapts to your knowledge level, learning style, and pace to create a custom educational journey.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: "from-socratix-teal/20 to-transparent",
      hoverColor: "group-hover:from-socratix-teal/30",
    },
    {
      title: "Real-time Feedback",
      description: "Receive immediate, constructive feedback that helps identify and address knowledge gaps.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-socratix-pink/20 to-transparent",
      hoverColor: "group-hover:from-socratix-pink/30",
    },
    {
      title: "Misconception Detection",
      description: "Advanced AI identifies and corrects fundamental misunderstandings through targeted questioning.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: "from-socratix-orange/20 to-transparent",
      hoverColor: "group-hover:from-socratix-orange/30",
    },
    {
      title: "Gamified Rewards",
      description: "Earn points, badges, and achievements as you progress, making learning engaging and motivating.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: "from-socratix-purple/20 to-transparent",
      hoverColor: "group-hover:from-socratix-purple/30",
    },
    {
      title: "Flashcards & Quizzes",
      description: "Automatically generated study materials that reinforce learning and improve knowledge retention.",
      icon: (
        <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: "from-socratix-green/20 to-transparent",
      hoverColor: "group-hover:from-socratix-green/30",
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-20 md:py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2640&q=80')"
        }}
      />
      
      {/* Animated background circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full animate-rotate-slow opacity-30"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              border: `2px solid ${i === 0 ? 'rgba(139, 92, 246, 0.1)' : i === 1 ? 'rgba(14, 165, 233, 0.1)' : 'rgba(217, 70, 239, 0.1)'}`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${60 + i * 20}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
            }}
          />
        ))}
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center animate-on-scroll">
            Key <span className="animated-gradient-text">Features</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 animate-on-scroll group relative overflow-hidden"
                style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-radial ${feature.color} ${feature.hoverColor} opacity-50 transition-all duration-500`} />
                
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300">{feature.title}</h3>
                <p className="text-muted-foreground text-sm relative z-10">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
