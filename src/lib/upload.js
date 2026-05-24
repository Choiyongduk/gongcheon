import { supabase, hasSupabase } from "./supabase";

const BUCKET = "media";

export function fileKind(file) {
  const t = file.type || "";
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/")) return "video";
  return "file";
}

export function humanSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

// returns { type, url, name, size, mime }
export async function uploadFile(file, folder = "uploads") {
  if (!hasSupabase) throw new Error("Supabase가 연결되어 있지 않습니다.");
  const safe = file.name.replace(/[^\w.\-가-힣]/g, "_");
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    type: fileKind(file),
    url: data.publicUrl,
    name: file.name,
    size: humanSize(file.size),
    mime: file.type,
  };
}

// extract youtube id from various url forms
export function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
