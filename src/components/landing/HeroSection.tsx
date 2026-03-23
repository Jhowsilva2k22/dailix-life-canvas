import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPattern from "@/assets/hero-pattern.jpg";

const benefits = [
  "Tarefas, metas e habitos em um so lugar",
  "Conteudo curado em video para cada area",
  "Insights educacionais personalizados",
];

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wide">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Produtividade pessoal reinventada
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-foreground opacity-0 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              Organize sua vida inteira em uma{" "}
              <span className="text-gradient">unica plataforma</span>
            </h1>

            <p
              className="text-muted-foreground text-lg max-w-lg leading-relaxed opacity-0 animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Produtividade, familia, negocios e bem-estar — tudo conectado com
              curadoria de conteudo e insights que realmente importam.
            </p>

            <ul
              className="flex flex-col gap-2.5 opacity-0 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div
              className="flex flex-wrap gap-3 pt-2 opacity-0 animate-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              <Button variant="hero" size="lg">
                Comece gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Ver demo
              </Button>
            </div>
          </div>

          <div
            className="opacity-0 animate-fade-up relative"
            style={{ animationDelay: "200ms" }}
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated border">
              <img
                src={heroPattern}
                alt="Dailix dashboard preview"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default HeroSection;
