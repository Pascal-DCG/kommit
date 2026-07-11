import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { useProfile } from "@/hooks/use-profile";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { isDemoMode } from "@/lib/demo";
import { PRESET_AVATARS } from "@/lib/avatars";

interface AvatarPickerProps {
  open: boolean;
  onClose: () => void;
}

const MAX_SIZE = 256;

async function resizeToBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfuegbar.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Bild konnte nicht verarbeitet werden."))),
      "image/jpeg",
      0.85,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function AvatarPicker({ open, onClose }: AvatarPickerProps) {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!profile) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // gleicher File erneut waehlbar
    if (!file) return;

    setError("");
    setBusy(true);
    try {
      const blob = await resizeToBlob(file);

      if (isDemoMode() || !user) {
        const dataUrl = await blobToDataUrl(blob);
        await updateProfile({ avatar_url: dataUrl });
      } else {
        const path = `${user.id}/avatar.jpg`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);
        // Cache-Busting, da der Pfad gleich bleibt
        await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
      }
      onClose();
    } catch (err) {
      setError((err as Error).message || "Upload fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const pickPreset = async (url: string) => {
    setError("");
    setBusy(true);
    try {
      await updateProfile({ avatar_url: url });
      onClose();
    } catch (err) {
      setError((err as Error).message || "Konnte nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  };

  const removeAvatar = async () => {
    setError("");
    setBusy(true);
    try {
      await updateProfile({ avatar_url: null });
      onClose();
    } catch (err) {
      setError((err as Error).message || "Konnte nicht entfernt werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="mb-4 text-lg font-bold">Profilbild</h2>

            <div className="mb-5 flex justify-center">
              <Avatar
                firstName={profile.first_name}
                lastName={profile.last_name}
                color={profile.avatar_color}
                avatarUrl={profile.avatar_url}
                size="lg"
              />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              Foto hochladen / aufnehmen
            </Button>

            <p className="mb-3 mt-6 text-sm font-medium text-muted-foreground">
              oder Avatar waehlen
            </p>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((url) => {
                const active = profile.avatar_url === url;
                return (
                  <button
                    key={url}
                    type="button"
                    disabled={busy}
                    onClick={() => pickPreset(url)}
                    className={`overflow-hidden rounded-full ring-2 transition ${
                      active ? "ring-primary" : "ring-transparent hover:ring-border"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full" />
                  </button>
                );
              })}
            </div>

            {profile.avatar_url && (
              <Button
                variant="ghost"
                className="mt-5 w-full text-destructive hover:text-destructive"
                disabled={busy}
                onClick={removeAvatar}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Bild entfernen (Initialen verwenden)
              </Button>
            )}

            {error && (
              <p className="mt-3 text-center text-sm text-destructive">{error}</p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
