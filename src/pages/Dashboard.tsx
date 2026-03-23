import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <header
        className="flex items-center justify-between h-16 px-6"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <span className="text-lg font-bold" style={{ color: "#1E3A5F" }}>Dailix</span>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
          style={{ color: "#64748B" }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>
      <main className="container py-12">
        <h1 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
          Bem-vindo ao Dailix
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#64748B" }}>
          Seu dashboard sera construido aqui.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
