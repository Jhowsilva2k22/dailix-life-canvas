import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";

const navLinks = [
  { label: "Recursos", href: "#features" },
  { label: "Planos", href: "#pricing" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(248,250,252,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="text-lg font-bold" style={{ color: "#1E3A5F" }}>
          Dailix
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1E3A5F")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
            style={{ color: "#64748B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1E3A5F";
              e.currentTarget.style.background = "rgba(30,58,95,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748B";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Entrar
          </button>
          <button
            className="px-5 py-2 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
              boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,180,216,0.45)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,180,216,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Comece gratis
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 transition-colors active:scale-95"
          style={{ color: "#64748B" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden animate-fade-in"
          style={{
            background: "rgba(248,250,252,0.95)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="py-2 text-sm"
                style={{ color: "#64748B" }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <button className="py-2 text-sm font-medium" style={{ color: "#64748B" }}>
                Entrar
              </button>
              <button
                className="py-2.5 text-sm font-semibold text-white rounded-[10px]"
                style={{
                  background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                  boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                }}
              >
                Comece gratis
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
