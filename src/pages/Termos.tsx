import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Termos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "#0C1222" }}>
      <div
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
        style={{
          background: "rgba(12,18,34,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="container flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span
            className="font-display text-sm tracking-wide"
            style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, letterSpacing: "0.06em" }}
          >
            Dailix
          </span>
        </div>
      </div>

      <div className="container pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <span
            className="text-[11px] tracking-[0.14em] uppercase block mb-4"
            style={{ color: "rgba(0,180,216,0.5)", fontWeight: 400 }}
          >
            Legal
          </span>
          <h1
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight mb-12"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Termos de Uso
          </h1>

          <div className="flex flex-col gap-10" style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>
            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                01 — Aceitação dos Termos
              </h2>
              <p>
                Ao acessar ou utilizar o Dailix, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize a plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                02 — Descrição do Serviço
              </h2>
              <p>
                O Dailix é um sistema pessoal de execução que permite ao usuário organizar tarefas, metas, hábitos e insights em um ambiente digital privado e contínuo.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                03 — Conta do Usuário
              </h2>
              <p>
                Para utilizar os recursos completos do Dailix, é necessário criar uma conta com informações válidas. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades realizadas na sua conta.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                04 — Uso Aceitável
              </h2>
              <p>
                Você concorda em utilizar o Dailix exclusivamente para fins pessoais e legítimos. É proibido utilizar a plataforma para atividades ilegais, distribuição de conteúdo prejudicial ou qualquer uso que comprometa o funcionamento do serviço.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                05 — Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo, design, código e funcionalidades do Dailix são propriedade exclusiva do Dailix. É proibida a reprodução, distribuição ou modificação sem autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                06 — Limitação de Responsabilidade
              </h2>
              <p>
                O Dailix é fornecido "como está". Não garantimos disponibilidade ininterrupta nem nos responsabilizamos por perdas decorrentes do uso ou impossibilidade de uso da plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                07 — Alterações nos Termos
              </h2>
              <p>
                Reservamos o direito de atualizar estes termos a qualquer momento. Alterações significativas serão comunicadas através da plataforma. O uso continuado após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <div
              className="mt-6 pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                Última atualização: Março de 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Termos;
