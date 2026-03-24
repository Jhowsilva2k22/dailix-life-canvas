import { useEffect, useCallback, useRef } from "react";
import { Search, FileText, Target, Heart, Lightbulb, Loader2, X, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGlobalSearch, SearchResult, SearchResultType } from "@/hooks/useGlobalSearch";

const typeConfig: Record<SearchResultType, { label: string; labelPlural: string; icon: typeof Search; color: string }> = {
  task: { label: "Tarefa", labelPlural: "Tarefas", icon: FileText, color: "var(--dash-accent)" },
  goal: { label: "Meta", labelPlural: "Metas", icon: Target, color: "var(--dash-warning-text)" },
  habit: { label: "Hábito", labelPlural: "Hábitos", icon: Heart, color: "var(--dash-success-text)" },
  insight: { label: "Insight", labelPlural: "Insights", icon: Lightbulb, color: "var(--dash-purple-text)" },
};

export interface SearchFocus {
  section: string;
  type: SearchResultType;
  id: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (focus: SearchFocus) => void;
}

const quickLinks: { type: SearchResultType; section: string }[] = [
  { type: "task", section: "foco" },
  { type: "goal", section: "foco" },
  { type: "habit", section: "bem-estar" },
  { type: "insight", section: "inicio" },
];

export default function GlobalSearchDialog({ open, onClose, onSelect }: Props) {
  const { query, setQuery, results, loading, error } = useGlobalSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open, setQuery]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleSelect = useCallback((item: SearchResult) => {
    onSelect({ section: item.route, type: item.type, id: item.id });
    onClose();
  }, [onSelect, onClose]);

  const grouped = results.reduce<Record<SearchResultType, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  const groupOrder: SearchResultType[] = ["task", "goal", "habit", "insight"];
  const hasResults = results.length > 0;
  const trimmedLen = query.trim().length;
  const showEmpty = !loading && !error && !hasResults && trimmedLen >= 2;
  const showSuggestions = trimmedLen < 2 && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Desktop: centered modal | Mobile: fullscreen overlay */}
      <DialogContent
        className="p-0 gap-0 overflow-hidden search-dialog-content"
        style={{
          background: "var(--dash-surface-elevated)",
          border: "1px solid var(--dash-border-strong)",
          boxShadow: "var(--dash-shadow-modal)",
        }}
      >
        {/* Fixed search header */}
        <div
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--dash-border)", height: 52 }}
        >
          <Search size={18} style={{ color: "var(--dash-text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tarefas, metas, hábitos..."
            className="flex-1 bg-transparent outline-none text-base touch-compact"
            style={{
              color: "#E2E8F0",
              caretColor: "#00B4D8",
              WebkitTextFillColor: "#E2E8F0",
              fontSize: 16,
              lineHeight: "1.5",
            }}
          />
          <style dangerouslySetInnerHTML={{ __html: `
            .search-dialog-content input::placeholder {
              color: #64748B !important;
              -webkit-text-fill-color: #64748B !important;
              opacity: 1 !important;
            }
            .search-dialog-content input::selection {
              background: rgba(0, 180, 216, 0.35);
              color: #F1F5F9;
              -webkit-text-fill-color: #F1F5F9;
            }
          `}} />
          {loading && <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: "var(--dash-text-muted)" }} />}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center touch-compact"
            style={{ color: "var(--dash-text-muted)", width: 32, height: 32 }}
          >
            <X size={18} />
          </button>
          {/* Desktop ESC hint */}
          <kbd
            className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] touch-compact"
            style={{
              background: "var(--dash-muted-surface-hover)",
              color: "var(--dash-text-muted)",
              border: "1px solid var(--dash-border)",
              fontFamily: "inherit",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Scrollable results area */}
        <div className="search-results-scroll overflow-y-auto flex-1">
          {/* Initial suggestions when query is empty */}
          {showSuggestions && (
            <div className="px-3 py-3">
              <p
                className="px-2 pb-2 text-xs font-medium"
                style={{ color: "var(--dash-text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}
              >
                Buscar em
              </p>
              <div className="flex flex-wrap gap-2">
                {quickLinks.map(({ type, section }) => {
                  const config = typeConfig[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => setQuery(config.labelPlural.toLowerCase().slice(0, 3))}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors touch-compact"
                      style={{
                        background: "var(--dash-muted-surface)",
                        border: "1px solid var(--dash-border)",
                        color: "var(--dash-text-secondary)",
                        fontSize: 13,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface)"; }}
                    >
                      <Icon size={14} style={{ color: config.color }} />
                      {config.labelPlural}
                      <ArrowRight size={12} style={{ opacity: 0.4 }} />
                    </button>
                  );
                })}
              </div>

              {trimmedLen === 0 && (
                <p className="px-2 pt-4 text-xs" style={{ color: "var(--dash-text-muted)", opacity: 0.6 }}>
                  Digite para buscar por título ou descrição
                </p>
              )}

              {trimmedLen === 1 && (
                <p className="px-2 pt-4 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                  Mais um caractere para iniciar a busca...
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--dash-danger-text)" }}>
              {error}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="px-4 py-8 text-center" style={{ color: "var(--dash-text-muted)" }}>
              <Search size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1 opacity-70">Tente buscar com outras palavras</p>
            </div>
          )}

          {/* Grouped results */}
          {hasResults && groupOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            const config = typeConfig[type];
            const Icon = config.icon;

            return (
              <div key={type} className="py-1.5">
                <div
                  className="flex items-center gap-2 px-4 py-1.5"
                  style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}
                >
                  <Icon size={13} style={{ color: config.color }} />
                  {config.labelPlural}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-start gap-3 w-full px-4 py-3 text-left transition-colors touch-compact"
                    style={{ borderRadius: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: "var(--dash-text)", fontWeight: 450 }}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-xs truncate mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
