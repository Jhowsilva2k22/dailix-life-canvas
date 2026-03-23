import { useState, useCallback, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadModalProps {
  onClose: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.85);
  });
}

const AvatarUploadModal = ({ onClose }: AvatarUploadModalProps) => {
  const { user } = useAuth();
  const { refreshAvatar } = useAvatar();
  const [step, setStep] = useState<"upload" | "crop">("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setStep("crop");
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedArea || !user) return;
    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedArea);
      const path = `${user.id}/avatar.webp`;

      // Delete old avatar if exists
      await supabase.storage.from("avatars").remove([path]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/webp", upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      refreshAvatar();
      onClose();
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="font-display text-lg" style={{ color: "#0F172A", fontWeight: 400 }}>
            {step === "upload" ? "Alterar foto" : "Ajustar foto"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors" style={{ color: "#94A3B8" }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === "upload" && (
            <div
              className="flex flex-col items-center justify-center cursor-pointer transition-colors"
              style={{
                background: dragActive ? "rgba(0,180,216,0.08)" : "rgba(0,180,216,0.04)",
                border: `2px dashed ${dragActive ? "#00B4D8" : "rgba(0,180,216,0.3)"}`,
                borderRadius: 16,
                padding: 40,
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} style={{ color: "#00B4D8", opacity: 0.5 }} className="mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: "#0F172A" }}>
                Arraste sua foto aqui
              </p>
              <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                JPG, PNG ou WebP — max. 5MB
              </p>
              <span
                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ color: "#00B4D8", border: "1px solid rgba(0,180,216,0.3)" }}
              >
                Escolher arquivo
              </span>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect(file);
                }}
              />
            </div>
          )}

          {step === "crop" && imageSrc && (
            <>
              <div
                className="relative mb-4"
                style={{
                  height: 300,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#0F172A",
                }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    cropAreaStyle: { borderRadius: 12 },
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium mb-2 block" style={{ color: "#94A3B8" }}>
                  Ajustar zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#00B4D8" }}
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => { setStep("upload"); setImageSrc(null); }}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                  style={{ color: "#64748B" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm font-medium px-6 py-2.5 rounded-lg text-white transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Salvando..." : "Salvar foto"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;
