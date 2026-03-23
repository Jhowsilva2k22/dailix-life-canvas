import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  titulo: string;
  descricao: string | null;
  progresso: number;
  data_limite: string | null;
  status: string;
}

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ativa: { bg: "rgba(0,180,216,0.1)", color: "#00B4D8", label: "Ativa" },
    concluida: { bg: "rgba(16,185,129,0.1)", color: "#10B981", label: "Concluida" },
    pausada: { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", label: "Pausada" },
  };
  return map[s] || map.ativa;
};

const GoalsTab = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setGoals(data as Goal[]);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const deleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Meta removida.");
  };

  return (
    <div>
      {goals.length === 0 ? (
        <div
          data-reveal
          style={{ transitionDelay: "160ms", background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 14 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhuma meta criada ainda.</p>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="inline-flex items-center gap-1.5 mt-3 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Criar meta
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-reveal style={{ transitionDelay: "160ms" }}>
          {goals.map((goal) => {
            const badge = statusBadge(goal.status);
            return (
              <div
                key={goal.id}
                className="p-5 group transition-all duration-200"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#0F172A", fontSize: 15, fontWeight: 400 }}>{goal.titulo}</p>
                    {goal.descricao && <p className="mt-1" style={{ color: "#64748B", fontSize: 13, fontWeight: 300 }}>{goal.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontWeight: 400, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => { setEditing(goal); setShowModal(true); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: "#94A3B8" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: "#94A3B8" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${goal.progresso}%`, background: "linear-gradient(90deg, #1E3A5F, #00B4D8)" }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#0F172A", minWidth: 32, textAlign: "right" as const }}>{goal.progresso}%</span>
                </div>
                {goal.data_limite && (
                  <p className="mt-2" style={{ fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>
                    Prazo: {new Date(goal.data_limite + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            );
          })}
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="inline-flex items-center gap-1.5 mt-2 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Nova meta
          </button>
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchGoals(); }}
        />
      )}
    </div>
  );
};

/* ---------- Goal Modal ---------- */
interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSaved: () => void;
}

const GoalModal = ({ goal, onClose, onSaved }: GoalModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState(goal?.titulo || "");
  const [descricao, setDescricao] = useState(goal?.descricao || "");
  const [progresso, setProgresso] = useState(goal?.progresso || 0);
  const [dataLimite, setDataLimite] = useState(goal?.data_limite || "");
  const [status, setStatus] = useState(goal?.status || "ativa");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      progresso,
      data_limite: dataLimite || null,
      status,
    };

    if (goal) {
      await supabase.from("goals").update(payload).eq("id", goal.id);
    } else {
      await supabase.from("goals").insert({ ...payload, user_id: user.id });
    }

    toast.success(goal ? "Meta atualizada." : "Meta criada.");
    onSaved();
  };

  const statuses = [
    { value: "ativa", label: "Ativa" },
    { value: "pausada", label: "Pausada" },
    { value: "concluida", label: "Concluida" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-6" style={{ color: "#0F172A", fontWeight: 400 }}>
          {goal ? "Editar meta" : "Nova meta"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Titulo</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Ler 12 livros este ano"
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Descricao (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none"
              style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Progresso: {progresso}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progresso}
              onChange={(e) => setProgresso(Number(e.target.value))}
              className="w-full accent-[#00B4D8]"
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Data limite</label>
            <input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Status</label>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    border: `1.5px solid ${status === s.value ? "#00B4D8" : "#E2E8F0"}`,
                    background: status === s.value ? "rgba(0,180,216,0.08)" : "transparent",
                    color: status === s.value ? "#00B4D8" : "#64748B",
                    fontWeight: 400,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 400 }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!titulo.trim() || saving}
            className="flex-1 py-2.5 text-sm text-white rounded-lg transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", fontWeight: 400, letterSpacing: "0.02em" }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsTab;
