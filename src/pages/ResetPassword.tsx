import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for recovery event from the URL hash/token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    // Also check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        // Wait a moment for the hash to be processed
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            setValidSession(s ? true : false);
          });
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Não foi possível atualizar a senha. O link pode ter expirado.");
      setSubmitting(false);
      return;
    }

    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut();
    setSuccess(true);
    setSubmitting(false);
  };

  // Loading state
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F8FAFC" }}>
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#E2E8F0", borderTopColor: "#00B4D8" }}
        />
      </div>
    );
  }

  // Invalid/expired token
  if (validSession === false) {
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
          <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
            Link inválido ou expirado
          </h1>
          <p className="text-sm mt-2 mb-6" style={{ color: "#64748B" }}>
            Esse link de recuperação não é mais válido. Solicite um novo link para redefinir sua senha.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/recuperar-senha"
              className="w-full py-3 text-sm text-white rounded-[10px] text-center"
              style={{
                fontWeight: 400,
                letterSpacing: "0.02em",
                background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
              }}
            >
              Solicitar novo link
            </Link>
            <Link
              to="/login"
              className="w-full py-3 text-sm text-center rounded-[10px]"
              style={{ color: "#64748B" }}
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
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
          <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
            Senha atualizada
          </h1>
          <p className="text-sm mt-2 mb-6" style={{ color: "#64748B" }}>
            Sua senha foi redefinida com sucesso. Faça login com a nova senha.
          </p>
          <Link
            to="/login"
            className="w-full py-3 text-sm text-white rounded-[10px] text-center block"
            style={{
              fontWeight: 400,
              letterSpacing: "0.02em",
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  // Reset form
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
        <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
          Criar nova senha
        </h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748B" }}>
          Defina uma nova senha para sua conta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" style={{ color: "#0F172A" }}>Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#64748B" }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm" style={{ color: "#0F172A" }}>Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repita a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#64748B" }}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
            {submitting ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
