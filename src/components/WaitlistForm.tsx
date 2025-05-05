
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Please enter your email",
        description: "We need your email to add you to the waitlist.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast({
        title: "Successfully joined the waitlist!",
        description: "We'll notify you when Socratix is ready for you.",
      });
    }, 1500);
  };

  return (
    <section id="waitlist" className="py-20 md:py-32 bg-muted/50 relative overflow-hidden">
      {/* Refined background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-socratix-purple/5 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-socratix-teal/5 rounded-full filter blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="h-full w-full" style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.03) 1px, transparent 1px)'
          }}></div>
        </div>
        
        {/* Subtle floating particles */}
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/5 animate-float-subtle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 8 + 5}s`
            }}
          />
        ))}
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block animate-on-scroll">
            <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              Join Us
            </div>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-on-scroll font-display">
            Join the <span className="animated-gradient-text-alt">Waitlist</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
            Be among the first to experience the future of learning with Socratix.
            We'll notify you as soon as we're ready.
          </p>

          <div className="glass-card p-8 md:p-12 animate-on-scroll shadow-sm hover:shadow-md transition-all duration-300" style={{ transitionDelay: "0.2s" }}>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 focus:ring-2 focus:ring-primary/50 transition-all duration-300 shadow-sm"
                  required
                />
                <Button 
                  type="submit" 
                  className="sm:w-auto relative overflow-hidden group" 
                  disabled={loading}
                  variant="gradient"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </div>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By joining, you agree to receive updates about Socratix. 
                We'll never spam you or share your information.
              </p>
            </form>
          </div>
          
          <div className="mt-12 animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Early Signups</div>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary mb-1">92%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary mb-1">8</div>
                <div className="text-sm text-muted-foreground">Weeks to Launch</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
