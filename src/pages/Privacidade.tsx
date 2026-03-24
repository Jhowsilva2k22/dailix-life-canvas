import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacidade = () => {
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
            Política de Privacidade
          </h1>

          <div className="flex flex-col gap-10" style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>
            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                01 — Dados Coletados
              </h2>
              <p>
                O Dailix coleta apenas os dados necessários para o funcionamento da plataforma: endereço de e-mail, nome de exibição e dados de uso inseridos voluntariamente pelo usuário, como tarefas, metas, hábitos e insights.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                02 — Finalidade do Uso
              </h2>
              <p>
                Os dados são utilizados exclusivamente para fornecer e melhorar a experiência do usuário dentro da plataforma. Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                03 — Armazenamento e Segurança
              </h2>
              <p>
                Os dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. Adotamos medidas técnicas e organizacionais para proteger as informações contra acesso não autorizado, perda ou alteração.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                04 — Direitos do Usuário
              </h2>
              <p>
                Você pode, a qualquer momento, solicitar acesso, correção ou exclusão dos seus dados pessoais. Para exercer esses direitos, entre em contato através dos canais disponíveis na plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                05 — Cookies e Rastreamento
              </h2>
              <p>
                O Dailix utiliza cookies essenciais para autenticação e funcionamento da plataforma. Não utilizamos cookies de rastreamento para publicidade ou perfil comportamental.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                06 — Retenção de Dados
              </h2>
              <p>
                Os dados são mantidos enquanto a conta estiver ativa. Após exclusão da conta, os dados pessoais serão removidos dos nossos sistemas em até 30 dias.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                07 — Alterações nesta Política
              </h2>
              <p>
                Esta política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas pela plataforma. Recomendamos a revisão periódica deste documento.
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

export default Privacidade;
