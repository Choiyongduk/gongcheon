import { supabase, hasSupabase } from "./supabase";
import * as seed from "../data/seed";

const SEEN_KEY = "fain_last_seen";

export function getLastSeen() {
  try { return localStorage.getItem(SEEN_KEY) || "1970-01-01"; } catch { return "1970-01-01"; }
}
export function markSeen() {
  try { localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch {}
}

const TYPE_META = {
  notices: { label: "공지", to: (r) => `/notice/${r.id}` },
  minutes: { label: "회의록", to: (r) => `/minute/${r.id}` },
  documents: { label: "자료", to: () => `/archive` },
  suggestions: { label: "개선의견", to: () => `/suggestions` },
};

// 최근 글들을 한데 모아 시간순으로 반환
export async function fetchFeed(limit = 40) {
  if (!hasSupabase) {
    return buildFeed({
      notices: seed.NOTICES, minutes: seed.MINUTES, documents: seed.DOCUMENTS, suggestions: seed.SUGGESTIONS,
    });
  }
  const [n, m, d, s] = await Promise.all([
    supabase.from("notices").select("id,title,created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("minutes").select("id,round,title,date").order("date", { ascending: false }).limit(limit),
    supabase.from("documents").select("id,name,created_at").order("created_at", { ascending: false }).limit(limit),
    supabase.from("suggestions").select("id,body,created_at").order("created_at", { ascending: false }).limit(limit),
  ]);
  return buildFeed({
    notices: n.data || [], minutes: m.data || [], documents: d.data || [], suggestions: s.data || [],
  }).slice(0, limit);
}

function buildFeed({ notices, minutes, documents, suggestions }) {
  const items = [];
  (notices || []).forEach((r) => items.push({ type: "notices", id: r.id, when: r.created_at, title: r.title }));
  (minutes || []).forEach((r) => items.push({ type: "minutes", id: r.id, when: r.date, title: r.title || `제${r.round}차 회의` }));
  (documents || []).forEach((r) => items.push({ type: "documents", id: r.id, when: r.created_at, title: r.name }));
  (suggestions || []).forEach((r) => items.push({ type: "suggestions", id: r.id, when: r.created_at, title: r.body }));
  items.forEach((it) => {
    const meta = TYPE_META[it.type];
    it.label = meta.label;
    it.to = meta.to(it);
    it.ts = new Date(it.when).getTime() || 0;
  });
  return items.sort((a, b) => b.ts - a.ts);
}

export function countUnseen(feed, lastSeen) {
  const t = new Date(lastSeen).getTime() || 0;
  return feed.filter((i) => i.ts > t).length;
}
