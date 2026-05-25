import { useEffect, useState } from "react";
import { supabase, hasSupabase } from "../lib/supabase";
import * as seed from "../data/seed";

const FALLBACK = {
  members: seed.MEMBERS,
  notices: seed.NOTICES,
  rules: seed.RULES,
  minutes: seed.MINUTES,
  documents: seed.DOCUMENTS,
  events: seed.EVENTS,
  suggestions: seed.SUGGESTIONS,
};

const ORDER = {
  members: { col: "sort", asc: true },
  notices: { col: "created_at", asc: false },
  rules: { col: "sort", asc: true },
  minutes: { col: "round", asc: false },
  documents: { col: "created_at", asc: false },
  events: { col: "date", asc: true },
  suggestions: { col: "created_at", asc: false },
};

export function useCollection(table) {
  const [data, setData] = useState(hasSupabase ? null : FALLBACK[table]);
  const [loading, setLoading] = useState(hasSupabase);

  async function load() {
    const o = ORDER[table];
    if (!o) { setData([]); setLoading(false); return; } // unknown/virtual table
    if (!hasSupabase) {
      setData(FALLBACK[table]);
      return;
    }
    setLoading(true);
    const { data: rows, error } = await supabase
      .from(table)
      .select("*")
      .order(o.col, { ascending: o.asc });
    if (error) {
      console.warn(`[${table}]`, error.message);
      setData(FALLBACK[table]); // graceful fallback
    } else {
      // sort notices so pinned float to top
      let r = rows || [];
      if (table === "notices") r = [...r].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setData(r);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [table]);

  return { data: data || [], loading, reload: load };
}
