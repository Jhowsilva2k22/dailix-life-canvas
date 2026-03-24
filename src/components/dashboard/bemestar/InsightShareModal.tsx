import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { X, Download, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface InsightShareData {
  titulo: string;
  texto: string;
  categoria: string;
  categoriaLabel: string;
}

interface InsightShareModalProps {
  insight: InsightShareData | null;
  onClose: () => void;
}

type Format = "feed" | "story";

const FORMAT_CONFIG: Record<Format, { w: number; h: number; label: string }> = {
  feed: { w: 1080, h: 1350, label: "Feed" },
  story: { w: 1080, h: 1920, label: "Story" },
};

const InsightShareModal = ({ insight, onClose }: InsightShareModalProps) => {
  const [format, setFormat] = useState<Format>("feed");
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const cfg = FORMAT_CONFIG[format];
  const previewScale = format === "feed" ? 0.28 : 0.2;

  const generate = useCallback(async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: cfg.w,
        height: cfg.h,
        pixelRatio: 3,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch {
      toast.error("Erro ao gerar imagem");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [cfg]);

  const handleDownload = useCallback(async () => {
    const blob = await generate();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailix-insight-${format}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Imagem salva");
  }, [generate, format]);

  const handleShare = useCallback(async () => {
    const blob = await generate();
    if (!blob) return;
    const file = new File([blob], `dailix-insight-${format}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (e: any) {
        if (e.name !== "AbortError") handleDownload();
      }
    } else {
      handleDownload();
    }
  }, [generate, format, handleDownload]);

  if (!insight) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: "#141B2D", border: "1px solid #1E2A40" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1E2A40" }}>
            <span style={{ color: "#E2E8F0", fontSize: 14, fontWeight: 500 }}>Compartilhar</span>
            <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "#64748B" }}>
              <X size={18} />
            </button>
          </div>

          {/* Format selector */}
          <div className="flex gap-2 px-5 pt-4">
            {(["feed", "story"] as Format[]).map((f) => {
              const active = format === f;
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="px-4 py-2 rounded-full transition-all"
                  style={{
                    fontSize: 12,
                    fontWeight: active ? 500 : 400,
                    color: active ? "#00B4D8" : "#64748B",
                    background: active ? "rgba(0,180,216,0.1)" : "transparent",
                    border: `1px solid ${active ? "rgba(0,180,216,0.2)" : "#1E2A40"}`,
                  }}
                >
                  {FORMAT_CONFIG[f].label}
                </button>
              );
            })}
          </div>

          {/* Preview container */}
          <div className="flex justify-center px-5 py-5">
            <div
              className="overflow-hidden rounded-xl"
              style={{
                width: cfg.w * previewScale,
                height: cfg.h * previewScale,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div
                ref={canvasRef}
                style={{
                  width: cfg.w,
                  height: cfg.h,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <InsightCanvas insight={insight} format={format} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pb-5">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#E2E8F0",
                background: "#1A2438",
                border: "1px solid #1E2A40",
                opacity: generating ? 0.6 : 1,
              }}
            >
              <Download size={15} />
              Salvar
            </button>
            <button
              onClick={handleShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#0C1222",
                background: "#00B4D8",
                opacity: generating ? 0.6 : 1,
              }}
            >
              <Share2 size={15} />
              {generating ? "Gerando..." : "Compartilhar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ───────── Canvas templates ───────── */

const InsightCanvas = ({
  insight,
  format,
}: {
  insight: InsightShareData;
  format: Format;
}) => {
  const cfg = FORMAT_CONFIG[format];
  const isFeed = format === "feed";

  return (
    <div
      style={{
        width: cfg.w,
        height: cfg.h,
        background: "#0C1222",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Subtle gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: isFeed ? -120 : -160,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: isFeed ? -100 : -140,
          left: -60,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,216,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, #00B4D8, transparent)",
          opacity: 0.6,
        }}
      />

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isFeed ? "100px 80px" : "140px 80px",
        }}
      >
        {/* Category pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: isFeed ? 32 : 40,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00B4D8",
              opacity: 0.7,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: "#00B4D8",
              opacity: 0.8,
            }}
          >
            {insight.categoriaLabel}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: isFeed ? 52 : 56,
            fontWeight: 600,
            lineHeight: 1.25,
            color: "#F1F5F9",
            marginBottom: isFeed ? 28 : 36,
            letterSpacing: "-0.01em",
          }}
        >
          {insight.titulo}
        </h2>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 2,
            background: "#00B4D8",
            opacity: 0.4,
            marginBottom: isFeed ? 28 : 36,
          }}
        />

        {/* Body text */}
        <p
          style={{
            fontSize: isFeed ? 26 : 28,
            fontWeight: 300,
            lineHeight: 1.7,
            color: "#94A3B8",
            maxWidth: isFeed ? 900 : 920,
          }}
        >
          {insight.texto}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0 72px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "linear-gradient(135deg, #00B4D8, #0077B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>D</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 400, color: "#475569", letterSpacing: "0.04em" }}>
            via Dailix
          </span>
        </div>
        <span style={{ fontSize: 16, color: "#334155", fontWeight: 300 }}>
          dailix.app
        </span>
      </div>
    </div>
  );
};

export default InsightShareModal;
