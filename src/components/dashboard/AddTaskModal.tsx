import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskModalProps {
  onClose: () => void;
  onSaved: () => void;
  defaultGoalId?: string | null;
}

interface GoalOption {
  id: string;
  titulo: string;
}

const AddTaskModal = ({ onClose, onSaved, defaultGoalId }: AddTaskModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [goalId, setGoalId] = useState<string>(defaultGoalId || "");
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("goals").select("id, titulo").eq("user_id", user.id).eq("status", "ativa").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setGoals(data as GoalOption[]);
    });
  }, [user]);

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({ user_id: user.id, titulo: titulo.trim(), descricao: descricao.trim() || null, prazo: prazo || null, prioridade, goal_id: goalId || null });
    if (error) { toast.error("Erro ao salvar tarefa."); setSaving(false); return; }
    onSaved();
  };

  const priorities = [
    { value: "alta", label: "Alta", color: "#F87171" },
    { value: "media", label: "Media", color: "#FBBF24" },
    { value: "baixa", label: "Baixa", color: "#34D399" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg" style={{ color: "var(--dash-text)", fontWeight: 400 }}>Nova tarefa</h3>
          <button onClick={onClose} className="p-1" style={{ color: "var(--dash-text-muted)" }}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Titulo</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Finalizar relatorio" className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Descricao (opcional)</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes..." rows={3} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Prazo</label>
            <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)", colorScheme: "dark" }} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Prioridade</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button key={p.value} onClick={() => setPrioridade(p.value)} className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors" style={{
                  border: `1px solid ${prioridade === p.value ? p.color : "var(--dash-border-strong)"}`,
                  background: prioridade === p.value ? `${p.color}18` : "transparent",
                  color: prioridade === p.value ? p.color : "var(--dash-text-muted)",
                  fontWeight: 400,
                }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {goals.length > 0 && (
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Vincular a uma meta</label>
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}>
                <option value="">Nenhuma meta</option>
                {goals.map((g) => (<option key={g.id} value={g.id}>{g.titulo}</option>))}
              </select>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={!titulo.trim() || saving} className="w-full mt-6 py-3 text-sm rounded-lg transition-opacity disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", color: "white", fontWeight: 400, letterSpacing: "0.02em" }}>
          {saving ? "Salvando..." : "Salvar tarefa"}
        </button>
      </div>
    </div>
  );
};

export default AddTaskModal;
