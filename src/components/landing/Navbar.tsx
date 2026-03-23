import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-accent" />
          <span className="text-lg font-bold text-foreground">Dailix</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
          <a href="#areas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Areas</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Entrar</Button>
          <Button variant="hero" size="sm">Comece gratis</Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <div className="container py-4 flex flex-col gap-3">
            <a href="#features" className="py-2 text-sm text-muted-foreground hover:text-foreground">Recursos</a>
            <a href="#areas" className="py-2 text-sm text-muted-foreground hover:text-foreground">Areas</a>
            <a href="#pricing" className="py-2 text-sm text-muted-foreground hover:text-foreground">Planos</a>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm">Entrar</Button>
              <Button variant="hero" size="sm">Comece gratis</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
