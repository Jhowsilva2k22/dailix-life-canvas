import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HabitModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const categoryOptions = [
  { value: "saude", label: "Saude", color: "#10B981" },
  { value: "mental", label: "Mental", color: "#8B5CF6" },
  { value: "sono", label: "Sono", color: "#1E3A5F" },
  { value: "alimentacao", label: "Alimentacao", color: "#F59E0B" },
  { value: "aprendizado", label: "Aprendizado", color: "#00B4D8" },
];

const HabitModal = ({ onClose, onSaved }: HabitModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("saude");
  const [frequencia, setFrequencia] = useState("diario");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        frequencia,
      });
      if (error) throw error;
      onSaved();
    } catch {
      toast.error("Algo deu errado. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-6" style={{ color: "var(--dash-text)", fontWeight: 400 }}>Novo habito</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Titulo</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Descricao (opcional)</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none"
              style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoria(c.value)}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                  style={{
                    border: `1px solid ${categoria === c.value ? c.color : "var(--dash-border-strong)"}`,
                    background: categoria === c.value ? `${c.color}18` : "transparent",
                    color: categoria === c.value ? c.color : "var(--dash-text-muted)",
                    fontWeight: 400,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Frequencia</label>
            <div className="flex gap-2">
              {[{ value: "diario", label: "Diario" }, { value: "semanal", label: "Semanal" }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequencia(f.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
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
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid var(--dash-border-strong)", color: "var(--dash-text-muted)", fontWeight: 400 }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!titulo.trim() || saving}
            className="flex-1 py-2.5 text-sm rounded-lg transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", color: "white", fontWeight: 400, letterSpacing: "0.02em" }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitModal;
