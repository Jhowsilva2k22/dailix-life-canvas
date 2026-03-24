import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReminderField from "@/components/dashboard/ReminderField";

interface Habit {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  frequencia: string;
  streak: number;
  ativo: boolean;
}

interface HabitModalProps {
  onClose: () => void;
  onSaved: () => void;
  editingHabit?: Habit | null;
}

const categoryOptions = [
  { value: "saude", label: "Saúde", color: "var(--dash-success-text)" },
  { value: "mental", label: "Mental", color: "var(--dash-purple-text)" },
  { value: "sono", label: "Sono", color: "var(--dash-blue-text)" },
  { value: "alimentacao", label: "Alimentação", color: "var(--dash-warning-text)" },
  { value: "aprendizado", label: "Aprendizado", color: "var(--dash-accent)" },
];

const HabitModal = ({ onClose, onSaved, editingHabit }: HabitModalProps) => {
  const { user } = useAuth();
  const isEdit = !!editingHabit;
  const [titulo, setTitulo] = useState(editingHabit?.titulo ?? "");
  const [descricao, setDescricao] = useState(editingHabit?.descricao ?? "");
  const [categoria, setCategoria] = useState(editingHabit?.categoria ?? "saude");
  const [frequencia, setFrequencia] = useState(editingHabit?.frequencia ?? "diario");
  const [saving, setSaving] = useState(false);
  const [lembreteAtivo, setLembreteAtivo] = useState((editingHabit as any)?.lembrete_ativo ?? false);
  const [lembreteHorario, setLembreteHorario] = useState((editingHabit as any)?.lembrete_horario?.slice(0, 5) ?? "");

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        frequencia,
        lembrete_ativo: lembreteAtivo,
        lembrete_horario: lembreteAtivo && lembreteHorario ? lembreteHorario + ":00" : null,
      };
      if (isEdit && editingHabit) {
        const { error } = await supabase.from("habits").update(payload).eq("id", editingHabit.id);
        if (error) throw error;
        toast.success("Hábito atualizado");
      } else {
        const { error } = await supabase.from("habits").insert({ ...payload, user_id: user.id });
        if (error) throw error;
        toast.success("Hábito criado");
      }
      onSaved();
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
            {isEdit ? "Editar hábito" : "Novo hábito"}
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
              placeholder="Ex: Meditar 10 minutos"
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
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoria(c.value)}
                  className="px-3 py-1.5 text-xs rounded-lg transition-all duration-150"
                  style={{
                    border: `1px solid ${categoria === c.value ? c.color : "var(--dash-border-strong)"}`,
                    background: categoria === c.value ? "var(--dash-muted-surface-hover)" : "transparent",
                    color: categoria === c.value ? c.color : "var(--dash-text-muted)",
                    fontWeight: 400,
                    transform: categoria === c.value ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Frequência</label>
            <div className="flex gap-2">
              {[{ value: "diario", label: "Diário" }, { value: "semanal", label: "Semanal" }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequencia(f.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-150"
                  style={{
                    border: `1px solid ${frequencia === f.value ? "var(--dash-accent)" : "var(--dash-border-strong)"}`,
                    background: frequencia === f.value ? "var(--dash-accent-subtle)" : "transparent",
                    color: frequencia === f.value ? "var(--dash-accent)" : "var(--dash-text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg transition-colors active:scale-[0.98]" style={{ border: "1px solid var(--dash-border-strong)", color: "var(--dash-text-muted)", fontWeight: 400 }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!titulo.trim() || saving}
            className="flex-1 py-2.5 text-sm rounded-lg transition-all duration-150 disabled:opacity-50 active:scale-[0.98]"
            style={{ background: "var(--dash-gradient-primary)", color: "var(--dash-text)", fontWeight: 400, letterSpacing: "0.02em" }}
          >
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar hábito"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitModal;
