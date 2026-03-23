import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const Login = () => {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message === "Invalid login credentials"
        ? "Email ou senha incorretos."
        : error.message);
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
          De volta ao seu espaço.
        </h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748B" }}>
          Tudo organizado do jeito que você deixou.
        </p>

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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" style={{ color: "#0F172A" }}>Senha</Label>
              <button
                type="button"
                className="text-xs transition-colors"
                style={{ color: "#00B4D8" }}
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
          <span className="text-xs" style={{ color: "#94A3B8" }}>ou</span>
          <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
        </div>

        <p className="text-center text-sm" style={{ color: "#64748B" }}>
          Ainda nao tem conta?{" "}
          <Link to="/cadastro" className="font-medium" style={{ color: "#00B4D8" }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
