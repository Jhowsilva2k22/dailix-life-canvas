import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { X, Download, Share } from "lucide-react";
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
  const exportRef = useRef<HTMLDivElement>(null);

  const cfg = FORMAT_CONFIG[format];
  const previewScale = format === "feed" ? 0.28 : 0.2;

  const generate = useCallback(async (): Promise<Blob | null> => {
    if (!exportRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        width: cfg.w,
        height: cfg.h,
        pixelRatio: 1,
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
        await navigator.share({ files: [file], title: "Insight Dailix" });
      } catch (e: any) {
        if (e.name !== "AbortError") {
          toast.info("Use 'Salvar imagem' e envie manualmente");
        }
      }
    } else {
      toast.info("Use 'Salvar imagem' e envie manualmente");
    }
  }, [generate, format]);

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

          {/* Preview container (scaled for display only) */}
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

          {/* Offscreen full-size node for export only */}
          <div
            style={{
              position: "fixed",
              left: "-9999px",
              top: 0,
              pointerEvents: "none",
            }}
          >
            <div
              ref={exportRef}
              style={{ width: cfg.w, height: cfg.h }}
            >
              <InsightCanvas insight={insight} format={format} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pb-5">
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
              <Share size={15} />
              {generating ? "Gerando..." : "Compartilhar"}
            </button>
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
              Salvar imagem
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

  const titleLen = insight.titulo.length;
  const bodyLen = insight.texto.length;

  // Adaptive sizing based on content length
  const titleSize = isFeed
    ? (titleLen > 60 ? 54 : titleLen > 35 ? 64 : 72)
    : (titleLen > 60 ? 58 : titleLen > 35 ? 70 : 80);

  const bodySize = isFeed
    ? (bodyLen > 200 ? 30 : bodyLen > 120 ? 34 : 38)
    : (bodyLen > 200 ? 34 : bodyLen > 120 ? 38 : 42);

  const pad = isFeed ? 96 : 88;

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
      {/* Gradient orbs — larger for more atmosphere */}
      <div
        style={{
          position: "absolute",
          top: isFeed ? -80 : -100,
          right: -120,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: isFeed ? -60 : -80,
          left: -100,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Top editorial seal — logo + wordmark, very subtle */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent 5%, #00B4D8 50%, transparent 95%)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          padding: isFeed ? `48px ${pad}px 0` : `56px ${pad}px 0`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <svg
          width={isFeed ? 20 : 22}
          height={isFeed ? 20 : 22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00B4D8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
        <span
          style={{
            fontSize: isFeed ? 18 : 20,
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.06em",
          }}
        >
          Dailix
        </span>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isFeed
            ? `32px ${pad}px 48px`
            : `48px ${pad}px 60px`,
        }}
      >
        {/* Category */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: isFeed ? 36 : 48,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#00B4D8",
            }}
          />
          <span
            style={{
              fontSize: isFeed ? 24 : 28,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: "#00B4D8",
              opacity: 0.85,
            }}
          >
            {insight.categoriaLabel}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.18,
            color: "#F1F5F9",
            marginBottom: isFeed ? 36 : 48,
            letterSpacing: "-0.02em",
          }}
        >
          {insight.titulo}
        </h2>

        {/* Divider */}
        <div
          style={{
            width: 56,
            height: 3,
            background: "#00B4D8",
            opacity: 0.5,
            marginBottom: isFeed ? 36 : 48,
            borderRadius: 2,
          }}
        />

        {/* Body */}
        <p
          style={{
            fontSize: bodySize,
            fontWeight: 300,
            lineHeight: 1.65,
            color: "#94A3B8",
          }}
        >
          {insight.texto}
        </p>
      </div>

      {/* Footer — signature */}
      <div
        style={{
          padding: isFeed ? `0 ${pad}px 52px` : `0 ${pad}px 68px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg
            width={isFeed ? 22 : 26}
            height={isFeed ? 22 : 26}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00B4D8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <span style={{ fontSize: isFeed ? 20 : 24, fontWeight: 500, color: "#475569", letterSpacing: "0.04em" }}>
            via <span style={{ fontWeight: 600, color: "#64748B" }}>Dailix</span>
          </span>
        </div>
        <span style={{ fontSize: isFeed ? 18 : 22, color: "#4B6584", fontWeight: 400, letterSpacing: "0.02em" }}>
          dailix.app
        </span>
      </div>
    </div>
  );
};

export default InsightShareModal;
