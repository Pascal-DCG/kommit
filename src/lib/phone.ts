/**
 * Normalisiert eine (deutsche) Telefonnummer auf E.164-Format (+49...).
 *
 * Wichtig: entfernt die nationale Trunk-"0" direkt nach der Laendervorwahl,
 * damit "+49 0151 234" und "+49 151 234" dieselbe Nummer ergeben und keine
 * doppelten Accounts entstehen.
 */
export function normalizePhoneDE(raw: string): string {
  let s = raw.replace(/[^\d+]/g, ""); // nur Ziffern und +
  if (!s) return "";

  if (s.startsWith("00")) s = "+" + s.slice(2); // 0049... -> +49...
  if (!s.startsWith("+") && s.startsWith("49")) s = "+" + s; // 49... -> +49...
  if (s.startsWith("0")) s = "+49" + s.slice(1); // 0151... -> +49151...
  if (!s.startsWith("+")) s = "+49" + s; // 151... -> +49151...

  s = s.replace(/^\+490+/, "+49"); // +490151... -> +49151...
  return s;
}

/** Grobe Plausibilitaetspruefung: +49 gefolgt von 6-13 Ziffern. */
export function isValidPhoneDE(normalized: string): boolean {
  return /^\+49\d{6,13}$/.test(normalized);
}
