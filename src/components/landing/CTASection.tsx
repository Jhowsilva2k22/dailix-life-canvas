import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-28" ref={ref}>
      <div className="container">
        <div
          className={`relative rounded-2xl bg-primary p-10 md:p-16 text-center overflow-hidden transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Comece a organizar sua vida hoje
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Crie sua conta gratis e descubra como o Dailix pode transformar sua rotina.
            </p>
            <Button variant="hero" size="lg">
              Criar conta gratis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
