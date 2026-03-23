import {
  Target,
  Users,
  Briefcase,
  Heart,
  Play,
  Lightbulb,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Target,
    title: "Produtividade",
    desc: "Tarefas, metas semanais e habitos diarios com acompanhamento visual do seu progresso.",
  },
  {
    icon: Users,
    title: "Familia",
    desc: "Organize eventos, compromissos e decisoes familiares em um espaco compartilhado.",
  },
  {
    icon: Briefcase,
    title: "Negocios",
    desc: "Projetos, financas e objetivos profissionais com visao clara de resultados.",
  },
  {
    icon: Heart,
    title: "Bem-estar",
    desc: "Acompanhe sono, exercicios e saude mental com metricas que fazem sentido.",
  },
  {
    icon: Play,
    title: "Video Curado",
    desc: "Conteudo em video selecionado para cada area da sua vida, sem ruido.",
  },
  {
    icon: Lightbulb,
    title: "Insights",
    desc: "Aprenda com dados educacionais integrados que te ajudam a tomar melhores decisoes.",
  },
];

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-20 md:py-28" ref={ref}>
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que voce precisa, onde precisa
          </h2>
          <p className="text-muted-foreground text-lg">
            Seis pilares para organizar cada dimensao da sua vida com clareza e foco.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-2xl bg-card border p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: visible ? `${i * 80}ms` : "0ms",
                transitionProperty: "opacity, transform, box-shadow",
              }}
            >
              <f.icon className="h-6 w-6 text-accent mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
