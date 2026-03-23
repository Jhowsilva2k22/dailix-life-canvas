const footerLinks = [
  { label: "Recursos", href: "#features" },
  { label: "Planos", href: "#pricing" },
  { label: "Termos", href: "#" },
  { label: "Privacidade", href: "#" },
];

const Footer = () => (
  <footer style={{ background: "#0F172A" }}>
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <span className="text-lg font-bold text-white">Dailix</span>
        <div className="flex items-center gap-6">
          {footerLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="pt-6">
        <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
          {new Date().getFullYear()} Dailix. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
