
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
    <section id="waitlist" className="py-20 md:py-32 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the <span className="gradient-text">Waitlist</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Be among the first to experience the future of learning with Socratix.
            We'll notify you as soon as we're ready.
          </p>

          <div className="glass-card p-8 md:p-12">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="sm:w-auto" disabled={loading}>
                  {loading ? "Joining..." : "Join Waitlist"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By joining, you agree to receive updates about Socratix. 
                We'll never spam you or share your information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
