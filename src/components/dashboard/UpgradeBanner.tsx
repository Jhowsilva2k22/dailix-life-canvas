import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeBannerProps {
  message: string;
  compact?: boolean;
}

const UpgradeBanner = ({ message, compact = false }: UpgradeBannerProps) => {
  return (
    <div
      className={`rounded-xl flex items-center gap-3 ${compact ? "px-4 py-3" : "px-5 py-4"}`}
      style={{
        background: "var(--dash-accent-subtle)",
        border: "1px solid rgba(0,180,216,0.15)",
      }}
    >
      <Sparkles size={compact ? 14 : 16} style={{ color: "var(--dash-accent)", flexShrink: 0 }} />
      <p
        style={{
          color: "var(--dash-accent-muted)",
          fontSize: compact ? 12 : 13,
          fontWeight: 400,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </div>
  );
};

export default UpgradeBanner;
