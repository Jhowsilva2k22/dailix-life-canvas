import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReminderField from "./ReminderField";

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
  goal_id?: string | null;
}

interface GoalOption {
  id: string;
  titulo: string;
}

interface AddTaskModalProps {
  onClose: () => void;
  onSaved: () => void;
  defaultGoalId?: string | null;
  editingTask?: Task | null;
}

const priorityStyles: Record<string, { color: string; bg: string }> = {
  alta: { color: "var(--dash-danger-text)", bg: "var(--dash-danger-bg)" },
  media: { color: "var(--dash-warning-text)", bg: "var(--dash-warning-bg)" },
  baixa: { color: "var(--dash-success-text)", bg: "var(--dash-success-bg)" },
};

const AddTaskModal = ({ onClose, onSaved, defaultGoalId, editingTask }: AddTaskModalProps) => {
  const { user } = useAuth();
  const isEdit = !!editingTask;
  const [titulo, setTitulo] = useState(editingTask?.titulo ?? "");
  const [descricao, setDescricao] = useState(editingTask?.descricao ?? "");
  const [prazo, setPrazo] = useState(editingTask?.prazo ?? "");
  const [prioridade, setPrioridade] = useState(editingTask?.prioridade ?? "media");
  const [goalId, setGoalId] = useState<string>(editingTask?.goal_id ?? defaultGoalId ?? "");
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [lembreteAtivo, setLembreteAtivo] = useState((editingTask as any)?.lembrete_ativo ?? false);
  const [lembreteHorario, setLembreteHorario] = useState((editingTask as any)?.lembrete_horario?.slice(0, 5) ?? "");

  useEffect(() => {
    if (!user) return;
    supabase.from("goals").select("id, titulo").eq("user_id", user.id).eq("status", "ativa").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setGoals(data as GoalOption[]);
    });
  }, [user]);

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        prazo: prazo || null,
        prioridade,
        goal_id: goalId || null,
        lembrete_ativo: lembreteAtivo,
        lembrete_horario: lembreteAtivo && lembreteHorario ? lembreteHorario + ":00" : null,
      };
      if (isEdit && editingTask) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", editingTask.id);
        if (error) throw error;
        toast.success("Tarefa atualizada");
      } else {
        const { error } = await supabase.from("tasks").insert({ ...payload, user_id: user.id });
        if (error) throw error;
        toast.success("Tarefa criada");
      }
      onSaved();
    } catch {
      toast.error("Algo deu errado.");
      setSaving(false);
    }
  };

  const priorities = [
    { value: "alta", label: "Alta" },
    { value: "media", label: "Média" },
    { value: "baixa", label: "Baixa" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "var(--dash-overlay)" }} onClick={onClose}>
      <div
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "var(--dash-shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg" style={{ color: "var(--dash-text)", fontWeight: 400 }}>
            {isEdit ? "Editar tarefa" : "Nova tarefa"}
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
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Título</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Finalizar relatório" autoFocus className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Descrição (opcional)</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes..." rows={3} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none transition-colors" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Prazo</label>
            <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)", colorScheme: "dark" }} />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: "var(--dash-text-secondary)", fontWeight: 400 }}>Prioridade</label>
            <div className="flex gap-2">
              {priorities.map((p) => {
                const ps = priorityStyles[p.value];
                return (
                  <button key={p.value} onClick={() => setPrioridade(p.value)} className="flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-150" style={{
                    border: `1px solid ${prioridade === p.value ? ps.color : "var(--dash-border-strong)"}`,
                    background: prioridade === p.value ? ps.bg : "transparent",
                    color: prioridade === p.value ? ps.color : "var(--dash-text-muted)",
                    fontWeight: 400,
                    transform: prioridade === p.value ? "scale(1.02)" : "scale(1)",
                  }}>
                    {p.label}
                  </button>
                );
              })}
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
          <ReminderField
            lembreteAtivo={lembreteAtivo}
            lembreteHorario={lembreteHorario}
            onToggle={setLembreteAtivo}
            onTimeChange={setLembreteHorario}
            needsDate={!prazo}
          />
        </div>

        <button onClick={handleSave} disabled={!titulo.trim() || saving} className="w-full mt-6 py-3 text-sm rounded-lg transition-all duration-150 disabled:opacity-50 active:scale-[0.98]" style={{ background: "var(--dash-gradient-primary)", color: "var(--dash-text)", fontWeight: 400, letterSpacing: "0.02em" }}>
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </div>
  );
};

export default AddTaskModal;
