import { useEffect, useRef, useState } from "react";

const ProductVisualSection = () => {
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
    <section id="produto" ref={ref} className="py-20 md:py-28" style={{ background: "#0A0F1C" }}>
      <div className="container">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span
            className="text-[11px] tracking-[0.14em] uppercase mb-4 block"
            style={{ color: "rgba(0,180,216,0.6)", fontWeight: 400 }}
          >
            Interface
          </span>
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight"
            style={{ color: "#fff", fontWeight: 400 }}
          >
            Desenhado para clareza operacional.
          </h2>
        </div>

        {/* Product mockup frame */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
          }`}
        >
          <div
            style={{
              background: "#141B2D",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-5"
              style={{ height: 40, borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="flex gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              </div>
              <span className="ml-3 text-[11px]" style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
                app.dailix.com
              </span>
            </div>

            {/* Mockup content */}
            <div className="p-6 md:p-10">
              <div className="grid grid-cols-12 gap-4">
                {/* Sidebar mock */}
                <div className="col-span-3 hidden md:block space-y-3">
                  {["Foco", "Bem-estar", "Insights"].map((label, i) => (
                    <div
                      key={label}
                      className="rounded-lg px-3 py-2"
                      style={{
                        background: i === 0 ? "rgba(0,180,216,0.08)" : "transparent",
                        fontSize: 13,
                        color: i === 0 ? "rgba(0,180,216,0.8)" : "rgba(255,255,255,0.3)",
                        fontWeight: 300,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Main content mock */}
                <div className="col-span-12 md:col-span-9 space-y-4">
                  {/* Metrics bar */}
                  <div className="flex gap-6 mb-6">
                    {[
                      { label: "Tarefas", value: "12" },
                      { label: "Streak", value: "7 dias" },
                      { label: "Metas", value: "3 ativas" },
                    ].map((m) => (
                      <div key={m.label}>
                        <span className="block" style={{ fontSize: 20, color: "#fff", fontWeight: 400 }}>{m.value}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>{m.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Task items mock */}
                  {[
                    { text: "Revisar proposta comercial", done: true },
                    { text: "Enviar relatório semanal", done: false },
                    { text: "Agendar reunião de alinhamento", done: false },
                  ].map((task, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-4 py-3"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          border: task.done ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                          background: task.done ? "rgba(0,180,216,0.7)" : "transparent",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: task.done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                          fontWeight: 300,
                          textDecoration: task.done ? "line-through" : "none",
                        }}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductVisualSection;
