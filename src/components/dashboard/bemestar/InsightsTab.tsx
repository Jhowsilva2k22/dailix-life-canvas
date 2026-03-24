import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Sparkles, Brain, Moon, Target, Zap, Shield, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  id: string;
  titulo: string;
  texto: string;
  texto_curto: string | null;
  categoria: string;
  publicado_em: string;
  ordem: number | null;
}

const categoryMeta: Record<string, { label: string; icon: React.ElementType }> = {
  foco: { label: "Foco", icon: Target },
  disciplina: { label: "Disciplina", icon: Shield },
  saude: { label: "Saúde", icon: Zap },
  sono: { label: "Sono", icon: Moon },
  "clareza-mental": { label: "Clareza mental", icon: Brain },
  produtividade: { label: "Produtividade", icon: Sparkles },
};

const INITIAL_SHOW = 3;
const LOAD_MORE = 3;

const InsightsTab = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);

  useEffect(() => {
    supabase
      .from("insights")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        setInsights((data as Insight[]) || []);
        setLoading(false);
      });
  }, []);

  const insightDoDia = useMemo(() => {
    if (!insights.length) return null;
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return insights[dayOfYear % insights.length];
  }, [insights]);

  const categories = useMemo(() => {
    const cats = new Set(insights.map((i) => i.categoria));
    return Array.from(cats);
  }, [insights]);

  const filtered = useMemo(() => {
    const list = activeCategory
      ? insights.filter((i) => i.categoria === activeCategory)
      : insights;
    return list.filter((i) => i.id !== insightDoDia?.id);
  }, [insights, activeCategory, insightDoDia]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl p-6"
            style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
          >
            <div className="h-3 w-24 rounded-full mb-3" style={{ background: "var(--dash-border)" }} />
            <div className="h-4 w-3/4 rounded-full mb-2" style={{ background: "var(--dash-border)" }} />
            <div className="h-3 w-full rounded-full" style={{ background: "var(--dash-border)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
      >
        <Lightbulb size={32} style={{ color: "var(--dash-accent)", opacity: 0.5 }} />
        <p className="mt-4" style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>
          Insights em breve.
        </p>
      </div>
    );
  }

  const DiaIcon = insightDoDia ? (categoryMeta[insightDoDia.categoria]?.icon || Lightbulb) : Lightbulb;

  return (
    <div className="space-y-6">
      {/* Insight do dia */}
      {insightDoDia && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, var(--dash-surface) 0%, var(--dash-bg) 100%)",
            border: "1px solid var(--dash-accent)",
            borderColor: "rgba(0,194,255,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: "var(--dash-accent)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "var(--dash-accent)",
              }}
            >
              Insight do dia
            </span>
          </div>
          <h3
            className="font-display mb-2"
            style={{ color: "var(--dash-text)", fontSize: 16, fontWeight: 500, lineHeight: 1.4 }}
          >
            {insightDoDia.titulo}
          </h3>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>
            {insightDoDia.texto}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <DiaIcon size={12} style={{ color: "var(--dash-text-muted)", opacity: 0.6 }} />
            <span style={{ fontSize: 11, color: "var(--dash-text-muted)", opacity: 0.6 }}>
              {categoryMeta[insightDoDia.categoria]?.label || insightDoDia.categoria}
            </span>
          </div>
        </motion.div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className="px-3 py-1.5 rounded-full transition-all"
          style={{
            fontSize: 12,
            fontWeight: activeCategory === null ? 500 : 400,
            color: activeCategory === null ? "var(--dash-accent)" : "var(--dash-text-muted)",
            background: activeCategory === null ? "rgba(0,194,255,0.1)" : "transparent",
            border: `1px solid ${activeCategory === null ? "rgba(0,194,255,0.2)" : "var(--dash-border)"}`,
          }}
        >
          Todos
        </button>
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(active ? null : cat)}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                color: active ? "var(--dash-accent)" : "var(--dash-text-muted)",
                background: active ? "rgba(0,194,255,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(0,194,255,0.2)" : "var(--dash-border)"}`,
              }}
            >
              {meta?.label || cat}
            </button>
          );
        })}
      </div>

      {/* Insights list */}
      <div className="grid md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => {
            const Icon = categoryMeta[item.categoria]?.icon || Lightbulb;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--dash-surface)",
                  border: "1px solid var(--dash-border)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} style={{ color: "var(--dash-accent)", opacity: 0.7 }} />
                  <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--dash-text-muted)", opacity: 0.7 }}>
                    {categoryMeta[item.categoria]?.label || item.categoria}
                  </span>
                </div>
                <h3
                  className="font-display mb-2"
                  style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}
                >
                  {item.titulo}
                </h3>
                <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>
                  {item.texto_curto || item.texto}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center py-12 rounded-2xl"
          style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
        >
          <Lightbulb size={24} style={{ color: "var(--dash-text-muted)", opacity: 0.4 }} />
          <p className="mt-3" style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300 }}>
            Nenhum insight nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
};

export default InsightsTab;
