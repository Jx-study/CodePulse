import type { VisualData, ImageVisualData } from "../types/practice";

const ALLOWED_HOSTS = new Set(["res.cloudinary.com"]);
const MAX_URL_LENGTH = 500;

export function safeImageUrl(visual: VisualData): string | null {
  if (!visual || typeof visual !== "object") return null;
  const url = (visual as ImageVisualData).url;
  if (typeof url !== "string" || url.length > MAX_URL_LENGTH) return null;
  if (!url.startsWith("https://")) return null;
  try {
    const host = new URL(url).host;
    return ALLOWED_HOSTS.has(host) ? url : null;
  } catch {
    return null;
  }
}
