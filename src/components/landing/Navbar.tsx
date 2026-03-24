import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Diagnóstico", href: "/diagnostico", isRoute: true },
  { label: "Pilares", href: "#pilares" },
  { label: "Produto", href: "#produto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(12,18,34,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container flex items-center justify-between h-16">
        <a
          href="/"
          className="font-display text-lg tracking-wide"
          style={{ color: "#fff", fontWeight: 400, letterSpacing: "0.08em" }}
        >
          Dailix
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.5)", fontWeight: 300 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm rounded-lg transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => navigate("/cadastro")}
            className="px-5 py-2 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
            style={{
              fontWeight: 400,
              letterSpacing: "0.02em",
              background: "rgba(0,180,216,0.12)",
              color: "#00B4D8",
              border: "1px solid rgba(0,180,216,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,180,216,0.2)";
              e.currentTarget.style.borderColor = "rgba(0,180,216,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,180,216,0.12)";
              e.currentTarget.style.borderColor = "rgba(0,180,216,0.2)";
            }}
          >
            Começar agora
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 transition-colors active:scale-95"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden animate-fade-in"
          style={{
            background: "rgba(12,18,34,0.95)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="py-2 text-sm"
                style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => { setOpen(false); navigate("/login"); }}
                className="py-2 text-sm"
                style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}
              >
                Entrar
              </button>
              <button
                onClick={() => { setOpen(false); navigate("/cadastro"); }}
                className="py-2.5 text-sm rounded-lg"
                style={{
                  fontWeight: 400,
                  background: "rgba(0,180,216,0.12)",
                  color: "#00B4D8",
                  border: "1px solid rgba(0,180,216,0.2)",
                }}
              >
                Começar agora
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
