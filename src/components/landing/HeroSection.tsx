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

      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <div
          className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-3xl animate-mesh-1"
          style={{ background: "radial-gradient(circle, rgba(0,180,216,0.07) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] rounded-full blur-3xl animate-mesh-2"
          style={{ background: "radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-[40%] left-[40%] w-[450px] h-[450px] rounded-full blur-3xl animate-mesh-3"
          style={{ background: "radial-gradient(circle, rgba(0,180,216,0.04) 0%, transparent 70%)" }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
