import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError("Não foi possível enviar o link. Tente novamente.");
      return;
    }

    setSent(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F8FAFC" }}>
      <div
        className="w-full"
        style={{
          maxWidth: 420,
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          padding: 40,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm mb-6"
          style={{ color: "#64748B" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
          Recuperar senha
        </h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748B" }}>
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {sent ? (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
          >
            <p className="font-medium mb-1">Link enviado</p>
            <p>
              Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
              Verifique também a caixa de spam.
            </p>
            {cooldown && (
              <p className="mt-3 text-xs" style={{ color: "#64748B" }}>
                Aguarde alguns segundos antes de solicitar novamente.
              </p>
            )}
            <button
              type="button"
              disabled={cooldown}
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-sm font-medium disabled:opacity-40"
              style={{ color: "#00B4D8" }}
            >
              Enviar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" style={{ color: "#0F172A" }}>Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm text-white rounded-[10px] disabled:opacity-60"
              style={{
                fontWeight: 400,
                letterSpacing: "0.02em",
                background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
              }}
            >
              {submitting ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecuperarSenha;
