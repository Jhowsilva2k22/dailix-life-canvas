import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Tarefas, metas e habitos em um so lugar",
  "Conteudo curado em video para cada area",
  "Insights educacionais personalizados",
];

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="container relative z-10">
        <div className="max-w-2xl flex flex-col gap-6">
          <h1
            className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] text-foreground opacity-0 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            Organize sua vida inteira em uma unica plataforma
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
      </div>

      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default HeroSection;
