import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Pilares", href: "#pilares" },
  { label: "Produto", href: "#produto" },
  { label: "Termos", href: "/termos", isRoute: true },
  { label: "Privacidade", href: "/privacidade", isRoute: true },
];

const Footer = () => (
  <footer style={{ background: "#080C18" }}>
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <span
          className="font-display text-lg tracking-wide"
          style={{ color: "rgba(255,255,255,0.8)", fontWeight: 400, letterSpacing: "0.08em" }}
        >
          Dailix
        </span>
        <div className="flex items-center gap-6">
          {footerLinks.map((l) =>
            l.isRoute ? (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                {l.label}
              </a>
            )
          )}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} className="pt-6">
        <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
          {new Date().getFullYear()} Dailix. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
