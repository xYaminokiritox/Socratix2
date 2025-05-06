
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Robot3D from "./Robot3D";

const DemoSection = () => {
  return (
    <section id="demo" className="py-20 md:py-32 relative">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="gradient-text">Socratix</span> in Action
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <h3 className="text-2xl font-bold mb-4">Meet Your Learning Assistant</h3>
              <p className="text-muted-foreground mb-6">
                Our AI-powered learning companion guides you through complex topics using the 
                Socratic method, asking thoughtful questions that lead to deeper understanding and 
                critical thinking.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mr-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Personalized Learning Experience</p>
                    <p className="text-sm text-muted-foreground">Adapts to your knowledge level and learning style</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Real-time Feedback</p>
                    <p className="text-sm text-muted-foreground">Get immediate guidance as you work through concepts</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button variant="gradient" className="mr-4" asChild>
                  <Link to="/demo">Try Demo</Link>
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
            <div className="animate-on-scroll relative" style={{ transitionDelay: '0.4s' }}>
              <Robot3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
