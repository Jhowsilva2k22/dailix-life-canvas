import { useEffect, useCallback } from "react";
import { Search, FileText, Target, Heart, Lightbulb, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useGlobalSearch, SearchResult, SearchResultType } from "@/hooks/useGlobalSearch";

const typeConfig: Record<SearchResultType, { label: string; icon: typeof Search; color: string }> = {
  task: { label: "Tarefas", icon: FileText, color: "var(--dash-accent)" },
  goal: { label: "Metas", icon: Target, color: "var(--dash-warning-text)" },
  habit: { label: "Hábitos", icon: Heart, color: "var(--dash-success-text)" },
  insight: { label: "Insights", icon: Lightbulb, color: "var(--dash-purple-text)" },
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

export default function GlobalSearchDialog({ open, onClose, onNavigate }: Props) {
  const { query, setQuery, results, loading, error } = useGlobalSearch();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open, setQuery]);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // parent handles open
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSelect = useCallback((item: SearchResult) => {
    onNavigate(item.route);
    onClose();
  }, [onNavigate, onClose]);

  const grouped = results.reduce<Record<SearchResultType, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  const groupOrder: SearchResultType[] = ["task", "goal", "habit", "insight"];
  const hasResults = results.length > 0;
  const showEmpty = !loading && !error && !hasResults && query.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{
          background: "var(--dash-surface-elevated)",
          border: "1px solid var(--dash-border-strong)",
          borderRadius: 16,
          boxShadow: "var(--dash-shadow-modal)",
          maxWidth: 520,
          width: "calc(100% - 32px)",
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: "1px solid var(--dash-border)", height: 52 }}
        >
          <Search size={18} style={{ color: "var(--dash-text-muted)", flexShrink: 0 }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tarefas, metas, hábitos, insights..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--dash-text)", caretColor: "var(--dash-accent)" }}
          />
          {loading && <Loader2 size={16} className="animate-spin" style={{ color: "var(--dash-text-muted)" }} />}
          <kbd
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px]"
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

        {/* Results area */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 360, minHeight: query.trim().length >= 2 ? 120 : 0 }}
        >
          {error && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--dash-danger-text)" }}>
              {error}
            </div>
          )}

          {showEmpty && (
            <div className="px-4 py-8 text-center" style={{ color: "var(--dash-text-muted)" }}>
              <Search size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1 opacity-70">Tente buscar com outras palavras</p>
            </div>
          )}

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
                  {config.label}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="flex items-start gap-3 w-full px-4 py-2.5 text-left transition-colors"
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

        {/* Footer hint */}
        {query.trim().length < 2 && (
          <div
            className="px-4 py-3 text-center text-xs"
            style={{ color: "var(--dash-text-muted)", borderTop: "1px solid var(--dash-border)" }}
          >
            Digite pelo menos 2 caracteres para buscar
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
