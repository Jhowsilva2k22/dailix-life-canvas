import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const AddTaskModal = ({ onClose, onSaved }: AddTaskModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      prazo: prazo || null,
      prioridade,
    });

    if (error) {
      toast.error("Erro ao salvar tarefa.");
      setSaving(false);
      return;
    }

    onSaved();
  };

  const priorities = [
    { value: "alta", label: "Alta", color: "#EF4444" },
    { value: "media", label: "Média", color: "#F59E0B" },
    { value: "baixa", label: "Baixa", color: "#22C55E" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg" style={{ color: "#0F172A", fontWeight: 400 }}>
            Nova tarefa
          </h3>
          <button onClick={onClose} className="p-1" style={{ color: "#94A3B8" }}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Finalizar relatório"
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{
                border: "1px solid #E2E8F0",
                color: "#0F172A",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none transition-colors"
              style={{
                border: "1px solid #E2E8F0",
                color: "#0F172A",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Prazo
            </label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors"
              style={{
                border: "1px solid #E2E8F0",
                color: "#0F172A",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Prioridade
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPrioridade(p.value)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    border: `1.5px solid ${prioridade === p.value ? p.color : "#E2E8F0"}`,
                    background: prioridade === p.value ? `${p.color}10` : "transparent",
                    color: prioridade === p.value ? p.color : "#64748B",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!titulo.trim() || saving}
          className="w-full mt-6 py-3 text-sm text-white rounded-lg transition-opacity disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          {saving ? "Salvando..." : "Salvar tarefa"}
        </button>
      </div>
    </div>
  );
};

export default AddTaskModal;
