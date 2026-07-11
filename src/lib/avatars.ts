// Vordefinierte, gebuendelte Avatar-Illustrationen (liegen in public/avatars/).
// avatar_url speichert einfach den Pfad; die Avatar-Komponente rendert ihn als <img>.
export const PRESET_AVATARS = [
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
  "/avatars/avatar-6.svg",
  "/avatars/avatar-7.svg",
  "/avatars/avatar-8.svg",
] as const;

export function isPresetAvatar(url: string | null | undefined): boolean {
  return !!url && url.startsWith("/avatars/");
}
