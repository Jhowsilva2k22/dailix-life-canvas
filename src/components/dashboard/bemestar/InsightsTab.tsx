const insights = [
  {
    num: "01",
    title: "Movimento diario",
    text: "30 minutos de atividade fisica aumentam em 35% a producao de BDNF — proteina que fortalece conexoes neurais e melhora memoria e foco.",
  },
  {
    num: "02",
    title: "Gratidao e neuroplasticidade",
    text: "Registrar 3 gratidoes por dia por 21 dias consecutivos reconfigura circuitos neurais, reduzindo cortisol e aumentando dopamina naturalmente.",
  },
  {
    num: "03",
    title: "A janela de consolidacao",
    text: "As primeiras 4 horas de sono sao responsaveis pela consolidacao de memorias do dia. Dormir menos de 6h reduz em 40% a retencao de aprendizado.",
  },
  {
    num: "04",
    title: "Repeticao espacada",
    text: "Revisar um conteudo apos 1 dia, 7 dias e 30 dias aumenta a retencao de 20% para 90% — e como o cerebro move informacao para memoria de longo prazo.",
  },
];

const InsightsTab = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {insights.map((item, i) => (
        <div
          key={item.num}
          data-reveal
          style={{
            transitionDelay: `${i * 80}ms`,
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          className="p-6"
        >
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "#00B4D8", fontWeight: 400 }}>{item.num}</span>
          <h3 className="font-display mt-2 mb-2" style={{ color: "#0F172A", fontSize: 16, fontWeight: 400 }}>
            {item.title}
          </h3>
          <p style={{ color: "#64748B", fontSize: 14, fontWeight: 300, lineHeight: 1.7 }}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default InsightsTab;
