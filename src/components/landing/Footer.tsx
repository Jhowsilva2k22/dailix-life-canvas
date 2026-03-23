import { LayoutDashboard } from "lucide-react";

const Footer = () => (
  <footer className="border-t py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-accent" />
        <span className="font-semibold text-foreground">Dailix</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {new Date().getFullYear()} Dailix. Todos os direitos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
