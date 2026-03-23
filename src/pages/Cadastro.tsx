import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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

  const [redirectChecked, setRedirectChecked] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !session) {
      setRedirectChecked(true);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => {
        setRedirectTo(data?.onboarding_completed ? "/dashboard" : "/welcome");
        setRedirectChecked(true);
      });
  }, [session, loading]);

  if (!redirectChecked || loading) return null;
  if (redirectTo) return <Navigate to={redirectTo} replace />;

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
          Seu espaço começa aqui.
        </h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748B" }}>
          Organização, foco e bem-estar — tudo em um só lugar. Grátis para começar.
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
            className="w-full py-3 text-sm text-white rounded-[10px] transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
            style={{
              fontWeight: 400,
              letterSpacing: "0.02em",
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
          >
            {submitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
          <span className="text-xs" style={{ color: "#94A3B8" }}>ou</span>
          <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
        </div>

        <button
          type="button"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (error) toast.error("Erro ao entrar com Google.");
          }}
          className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium rounded-[10px] transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <button
          type="button"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("apple", {
              redirect_uri: window.location.origin,
            });
            if (error) toast.error("Erro ao entrar com Apple.");
          }}
          className="w-full flex items-center justify-center gap-3 py-3 text-sm font-medium rounded-[10px] transition-all duration-200 active:scale-[0.97] mt-3"
          style={{
            background: "#000000",
            border: "1px solid #000000",
            color: "#FFFFFF",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.105 9.457c-.02-2.077 1.695-3.076 1.772-3.124-1.964-2.871-2.778-2.871-3.403-2.91-.54-.053-1.412.32-1.82.32-.428 0-1.057-.313-1.748-.303-.882.013-1.72.52-2.172 1.3-.944 1.633-.24 4.03.66 5.35.455.647.985 1.37 1.68 1.344.684-.027.937-.433 1.76-.433.812 0 1.044.433 1.753.42.732-.013 1.19-.647 1.628-1.3.524-.747.732-1.48.745-1.52-.02-.006-1.418-.547-1.432-2.144h-.023zM11.752 4.34c.364-.453.616-1.06.548-1.687-.532.027-1.198.367-1.576.807-.337.393-.64 1.04-.56 1.64.597.047 1.213-.3 1.588-.76z" fill="white"/>
          </svg>
          Continuar com Apple
        </button>

        <p className="text-center text-sm mt-4" style={{ color: "#64748B" }}>
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
