const insights = [
  { num: "01", title: "Movimento diario", text: "30 minutos de atividade fisica aumentam em 35% a producao de BDNF — proteina que fortalece conexoes neurais e melhora memoria e foco." },
  { num: "02", title: "Gratidao e neuroplasticidade", text: "Registrar 3 gratidoes por dia por 21 dias consecutivos reconfigura circuitos neurais, reduzindo cortisol e aumentando dopamina naturalmente." },
  { num: "03", title: "A janela de consolidacao", text: "As primeiras 4 horas de sono sao responsaveis pela consolidacao de memorias do dia. Dormir menos de 6h reduz em 40% a retencao de aprendizado." },
  { num: "04", title: "Repeticao espacada", text: "Revisar um conteudo apos 1 dia, 7 dias e 30 dias aumenta a retencao de 20% para 90% — e como o cerebro move informacao para memoria de longo prazo." },
];

const InsightsTab = () => {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {insights.map((item, i) => (
        <div
          key={item.num}
          data-reveal
          style={{ transitionDelay: `${i * 80}ms`, background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 16 }}
          className="p-6"
        >
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--dash-accent)", fontWeight: 400, opacity: 0.7 }}>{item.num}</span>
          <h3 className="font-display mt-2 mb-2" style={{ color: "var(--dash-text)", fontSize: 15, fontWeight: 400 }}>{item.title}</h3>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default InsightsTab;
