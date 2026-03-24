import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  refreshing: boolean;
}

const RefreshButton = ({ onRefresh, refreshing }: RefreshButtonProps) => (
  <button
    onClick={() => onRefresh()}
    disabled={refreshing}
    className="p-1 transition-all duration-300"
    style={{ color: refreshing ? "#1E3A5F" : "#94A3B8" }}
    onMouseEnter={(e) => {
      if (!refreshing) {
        e.currentTarget.style.color = "#1E3A5F";
        e.currentTarget.style.transform = "rotate(180deg)";
      }
    }}
    onMouseLeave={(e) => {
      if (!refreshing) {
        e.currentTarget.style.color = "#94A3B8";
        e.currentTarget.style.transform = "rotate(0deg)";
      }
    }}
  >
    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
  </button>
);

export default RefreshButton;
