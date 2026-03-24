import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  progresso: number;
  data_limite: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSaved: (g: Goal, isEdit: boolean) => void;
}

const GoalModal = ({ goal, onClose, onSaved }: GoalModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState(goal?.titulo ?? "");
  const [descricao, setDescricao] = useState(goal?.descricao ?? "");
  const [dataLimite, setDataLimite] = useState(goal?.data_limite ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const payload = { titulo: titulo.trim(), descricao: descricao.trim() || null, data_limite: dataLimite || null };
      if (goal) {
        const { error } = await supabase.from("goals").update(payload).eq("id", goal.id);
        if (error) throw error;
        toast.success("Meta salva");
        onSaved({ ...goal, ...payload } as Goal, true);
      } else {
        const { data, error } = await supabase.from("goals").insert({ ...payload, user_id: user.id, status: "ativa", progresso: 0 }).select().single();
        if (error) throw error;
        toast.success("Meta criada");
        onSaved(data as Goal, false);
      }
    } catch {
      toast.error("Algo deu errado.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "var(--dash-overlay)" }} onClick={onClose}>
      <div
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "var(--dash-shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg" style={{ color: "var(--dash-text)", fontWeight: 400 }}>
            {goal ? "Editar meta" : "Nova meta"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--dash-text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Ler 12 livros este ano"
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none transition-colors"
              style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Data limite (opcional)</label>
            <input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)", colorScheme: "dark" }}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg transition-colors active:scale-[0.98]" style={{ border: "1px solid var(--dash-border-strong)", color: "var(--dash-text-muted)", fontWeight: 400 }}>
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={!titulo.trim() || saving}
            className="flex-1 py-2.5 text-sm rounded-lg transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
            style={{ background: "var(--dash-gradient-primary)", color: "var(--dash-text)", fontWeight: 400, letterSpacing: "0.02em" }}
          >
            {saving ? "Salvando..." : goal ? "Salvar alterações" : "Criar meta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
