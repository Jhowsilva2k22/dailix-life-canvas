import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cadastro = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas nao coincidem.");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar.");
    }
    setSubmitting(false);
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
        <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
          Criar sua conta
        </h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748B" }}>
          Comece gratis. Sem cartao.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" style={{ color: "#0F172A" }}>Nome completo</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" style={{ color: "#0F172A" }}>Senha</Label>
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
            <Label htmlFor="confirm" style={{ color: "#0F172A" }}>Confirmar senha</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
          >
            {submitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#64748B" }}>
          Ja tem conta?{" "}
          <Link to="/login" className="font-medium" style={{ color: "#00B4D8" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;
