
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (id: string) => {
    // If on homepage, scroll to section
    if (window.location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    } else {
      // If on another page, navigate to homepage and then scroll
      navigate("/#" + id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold gradient-text">Socratix</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection("about")} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection("how-it-works")} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection("features")} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection("waitlist")} 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Join Waitlist
          </button>
          <Button asChild>
            <Link to="/demo">Try Demo</Link>
          </Button>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button 
              onClick={() => scrollToSection("about")} 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("how-it-works")} 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("features")} 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("waitlist")} 
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
            >
              Join Waitlist
            </button>
            <Link to="/demo" className="w-full">
              <Button className="w-full">Try Demo</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
