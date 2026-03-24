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

  const shareNative = useCallback(async (file: File) => {
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Insight Dailix" });
        return true;
      } catch (e: any) {
        if (e.name === "AbortError") return true; // user cancelled, not an error
      }
    }
    return false;
  }, []);

  const shareToDestination = useCallback(async (destination: string) => {
    const blob = await generate();
    if (!blob) return;
    const file = new File([blob], `dailix-insight-${format}.png`, { type: "image/png" });

    // All destinations attempt native share (OS handles routing to the correct app)
    const shared = await shareNative(file);
    if (shared) return;

    // Desktop fallback: copy to clipboard or inform user
    toast.info("Use o botão 'Salvar imagem' e envie manualmente");
  }, [generate, format, shareNative]);

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

          {/* Share destinations */}
          <div className="px-5 pb-2">
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#64748B" }}>
              Enviar para
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 px-5 pb-4">
            {[
              { id: "whatsapp", label: "WhatsApp", color: "#25D366" },
              { id: "instagram", label: "Instagram", color: "#E1306C" },
              { id: "tiktok", label: "TikTok", color: "#FE2C55" },
              { id: "native", label: "Mais", color: "#64748B" },
            ].map((dest) => (
              <button
                key={dest.id}
                onClick={() => shareToDestination(dest.id)}
                disabled={generating}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: "#94A3B8",
                  background: "#1A2438",
                  border: "1px solid #1E2A40",
                  opacity: generating ? 0.5 : 1,
                }}
              >
                <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {dest.id === "whatsapp" && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={dest.color}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  )}
                  {dest.id === "instagram" && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={dest.color}>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  )}
                  {dest.id === "tiktok" && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={dest.color}>
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.83 4.83 0 01-3.77-1.54V6.69h3.77z"/>
                    </svg>
                  )}
                  {dest.id === "native" && (
                    <Share size={20} color="#64748B" />
                  )}
                </div>
                {dest.label}
              </button>
            ))}
          </div>

          {/* Download */}
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
              {generating ? "Gerando..." : "Salvar imagem"}
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
