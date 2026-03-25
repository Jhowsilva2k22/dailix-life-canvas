import { useEffect, useState, useMemo } from "react";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Sparkles, Brain, Moon, Target, Zap, Shield, ChevronDown, Share2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InsightShareModal from "./InsightShareModal";
import UpgradeBanner from "../UpgradeBanner";
import { usePlanLimits } from "@/hooks/usePlanLimits";

interface InsightsTabProps {
  isActive?: boolean;
  onReadyChange?: (ready: boolean) => void;
  highlightId?: string | null;
  onHighlightConsumed?: () => void;
}

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

const InsightsTab = ({ isActive = true, onReadyChange, highlightId = null, onHighlightConsumed }: InsightsTabProps) => {
  const { isHighlighted } = useSearchHighlight(highlightId);
  const limits = usePlanLimits();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);
  const [shareInsight, setShareInsight] = useState<{
    titulo: string; texto: string; categoria: string; categoriaLabel: string;
  } | null>(null);

  const openShare = (item: Insight) => {
    setShareInsight({
      titulo: item.titulo,
      texto: item.texto,
      categoria: item.categoria,
      categoriaLabel: categoryMeta[item.categoria]?.label || item.categoria,
    });
  };

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

  useEffect(() => {
    if (isActive) onReadyChange?.(!loading);
  }, [isActive, loading, onReadyChange]);

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

  if (!limits.canAccessInsights) {
    return (
      <div className="space-y-4">
        <UpgradeBanner message="Insights completos são exclusivos do Plano Fundador. Ative para acessar conteúdos organizados por categoria." />
        {insightDoDia && (
          <div className="rounded-2xl p-6" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} style={{ color: "var(--dash-accent)" }} />
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--dash-accent)" }}>Prévia do dia</span>
            </div>
            <h3 style={{ color: "var(--dash-text)", fontSize: 16, fontWeight: 400, marginBottom: 8 }}>{insightDoDia.titulo}</h3>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, lineHeight: 1.7 }}>{insightDoDia.texto_curto || insightDoDia.texto.slice(0, 120) + "..."}</p>
          </div>
        )}
        <div className="flex items-center justify-center py-8 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <Lock size={16} style={{ color: "var(--dash-text-muted)", marginRight: 8 }} />
          <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300 }}>Mais {insights.length - 1} insights disponíveis no Plano Fundador</p>
        </div>
      </div>
    );
  }

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
            borderColor: "hsl(var(--accent) / 0.25)",
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
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DiaIcon size={12} style={{ color: "var(--dash-text-muted)", opacity: 0.6 }} />
              <span style={{ fontSize: 11, color: "var(--dash-text-muted)", opacity: 0.6 }}>
                {categoryMeta[insightDoDia.categoria]?.label || insightDoDia.categoria}
              </span>
            </div>
            <button
              onClick={() => openShare(insightDoDia)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "var(--dash-text-muted)", opacity: 0.5 }}
              title="Compartilhar"
            >
              <Share2 size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: null, label: "Todos" }, ...categories.map((c) => ({ key: c, label: categoryMeta[c]?.label || c }))].map(
          ({ key, label }) => {
            const active = activeCategory === key;
            return (
              <button
                key={label}
                onClick={() => { setActiveCategory(key); setVisibleCount(INITIAL_SHOW); }}
                className="px-3 py-1.5 rounded-full transition-all"
                style={{
                  fontSize: 12,
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--dash-accent)" : "var(--dash-text-muted)",
                  background: active ? "hsl(var(--accent) / 0.1)" : "transparent",
                  border: `1px solid ${active ? "hsl(var(--accent) / 0.2)" : "var(--dash-border)"}`,
                }}
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      {/* Insights list — curated */}
      {(() => {
        const visible = filtered.slice(0, visibleCount);
        const hasMore = filtered.length > visibleCount;
        return (
          <>
            <div className="grid md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {visible.map((item, i) => {
                  const Icon = categoryMeta[item.categoria]?.icon || Lightbulb;
                  return (
                    <motion.div
                      key={item.id}
                      data-search-id={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className={`rounded-2xl p-5 transition-all duration-500 ${isHighlighted(item.id) ? "search-highlight" : ""}`}
                      style={{
                        background: "var(--dash-surface)",
                        border: isHighlighted(item.id) ? "1px solid var(--dash-accent)" : "1px solid var(--dash-border)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} style={{ color: "var(--dash-accent)", opacity: 0.7 }} />
                          <span style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--dash-text-muted)", opacity: 0.7 }}>
                            {categoryMeta[item.categoria]?.label || item.categoria}
                          </span>
                        </div>
                        <button
                          onClick={() => openShare(item)}
                          className="p-1 rounded-lg transition-all"
                          style={{ color: "var(--dash-text-muted)", opacity: 0.4 }}
                          title="Compartilhar"
                        >
                          <Share2 size={13} />
                        </button>
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

            {hasMore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setVisibleCount((c) => c + LOAD_MORE)}
                className="flex items-center gap-1.5 mx-auto mt-2 px-4 py-2 rounded-full transition-all"
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: "var(--dash-accent)",
                  background: "hsl(var(--accent) / 0.06)",
                  border: "1px solid hsl(var(--accent) / 0.15)",
                }}
              >
                Explorar mais
                <ChevronDown size={14} />
              </motion.button>
            )}
          </>
        );
      })()}

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

      <InsightShareModal insight={shareInsight} onClose={() => setShareInsight(null)} />
    </div>
  );
};

export default InsightsTab;
