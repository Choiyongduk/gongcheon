import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { Card, Badge, Loading, fmtDate } from "../../components/ui";
import { IcPlus, IcEdit, IcTrash } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../lib/useData";
import { supabase, hasSupabase } from "../../lib/supabase";

/* field schema per table */
const SCHEMA = {
  notices: {
    label: "공지", order: ["category", "title", "body", "pinned", "created_at"],
    fields: {
      category: { t: "select", opts: ["성명", "공고", "안내"], label: "분류" },
      title: { t: "text", label: "제목" },
      body: { t: "area", label: "내용" },
      pinned: { t: "bool", label: "상단 고정" },
      created_at: { t: "date", label: "날짜" },
    },
    title: (r) => r.title,
  },
  minutes: {
    label: "회의록", order: ["round", "date", "place", "quorum", "agenda", "decided"],
    fields: {
      round: { t: "num", label: "회차" },
      date: { t: "date", label: "일자" },
      place: { t: "text", label: "장소" },
      quorum: { t: "text", label: "의결정족수" },
      agenda: { t: "lines", label: "안건 (줄바꿈 구분)" },
      decided: { t: "area", label: "의결사항" },
    },
    title: (r) => `제${r.round}차 회의`,
  },
  events: {
    label: "일정", order: ["title", "date", "phase", "kind"],
    fields: {
      title: { t: "text", label: "일정명" },
      date: { t: "date", label: "날짜" },
      phase: { t: "select", opts: ["done", "active", "upcoming"], label: "상태" },
      kind: { t: "select", opts: ["milestone", "meeting", "process", "election"], label: "유형" },
    },
    title: (r) => r.title,
  },
  documents: {
    label: "자료", order: ["name", "filetype", "size", "url", "created_at"],
    fields: {
      name: { t: "text", label: "자료명" },
      filetype: { t: "select", opts: ["PDF", "HWP", "DOCX", "XLSX", "ZIP"], label: "형식" },
      size: { t: "text", label: "용량" },
      url: { t: "text", label: "링크(URL)" },
      created_at: { t: "date", label: "날짜" },
    },
    title: (r) => r.name,
  },
  members: {
    label: "위원", order: ["name", "role", "org", "note", "lead", "sort"],
    fields: {
      name: { t: "text", label: "성명" },
      role: { t: "text", label: "직책" },
      org: { t: "text", label: "소속/비고" },
      note: { t: "text", label: "메모" },
      lead: { t: "bool", label: "위원장 강조" },
      sort: { t: "num", label: "정렬순서" },
    },
    title: (r) => `${r.name} ${r.role}`,
  },
  rules: {
    label: "규칙", order: ["no", "title", "body", "sort"],
    fields: {
      no: { t: "text", label: "조문(예: 제1조)" },
      title: { t: "text", label: "제목" },
      body: { t: "area", label: "내용" },
      sort: { t: "num", label: "정렬순서" },
    },
    title: (r) => `${r.no} ${r.title}`,
  },
};

const TABS = ["notices", "minutes", "events", "documents", "members", "rules", "suggestions"];

function Field({ def, value, onChange }) {
  if (def.t === "area" || def.t === "lines")
    return <textarea className="textarea" rows={def.t === "lines" ? 4 : 5} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  if (def.t === "select")
    return (
      <select className="select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>선택</option>
        {def.opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  if (def.t === "bool")
    return (
      <label className="row" style={{ gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> 사용
      </label>
    );
  return <input className="input" type={def.t === "num" ? "number" : def.t === "date" ? "date" : "text"} value={value ?? ""} onChange={(e) => onChange(def.t === "num" ? Number(e.target.value) : e.target.value)} />;
}

function Editor({ table, row, onClose, onSaved }) {
  const sc = SCHEMA[table];
  const [form, setForm] = useState(() => {
    const f = { ...row };
    if (Array.isArray(f.agenda)) f.agenda = f.agenda.join("\n");
    return f;
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const payload = { ...form };
    if (table === "minutes" && typeof payload.agenda === "string")
      payload.agenda = payload.agenda.split("\n").map((s) => s.trim()).filter(Boolean);
    delete payload.id;
    if (row.id) await supabase.from(table).update(payload).eq("id", row.id);
    else await supabase.from(table).insert(payload);
    setBusy(false);
    onSaved();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,28,76,0.45)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--paper)", width: "100%", maxWidth: 440, maxHeight: "88vh", overflowY: "auto", borderRadius: "20px 20px 0 0", padding: 20 }}>
        <div className="display" style={{ fontSize: 18, color: "var(--navy)", marginBottom: 16 }}>
          {row.id ? "수정" : "새로 추가"} · {sc.label}
        </div>
        {sc.order.map((k) => (
          <div key={k} style={{ marginBottom: 13 }}>
            <label className="label">{sc.fields[k].label}</label>
            <Field def={sc.fields[k]} value={form[k]} onChange={(v) => setForm((f) => ({ ...f, [k]: v }))} />
          </div>
        ))}
        <button className="btn btn-red" onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
        <button className="btn btn-ghost" style={{ marginTop: 9 }} onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin, ready } = useAuth();
  const [tab, setTab] = useState("notices");
  const [editing, setEditing] = useState(null);
  const { data, loading, reload } = useCollection(tab);

  if (!ready) return <Loading />;
  if (!hasSupabase) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const sc = SCHEMA[tab];
  const del = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await supabase.from(tab).delete().eq("id", id);
    reload();
  };

  return (
    <div className="page">
      <TopBar title="관리자" right={tab !== "suggestions" && (
        <button className="iconbtn" onClick={() => setEditing({})} aria-label="추가"><IcPlus size={24} /></button>
      )} />
      <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, background: tab === t ? "var(--navy)" : "#fff", color: tab === t ? "#fff" : "var(--muted)", boxShadow: tab === t ? "none" : "inset 0 0 0 1px var(--line)" }}>
            {t === "suggestions" ? "개선의견" : SCHEMA[t].label}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {loading ? <Loading /> : (
          <div className="stack" style={{ gap: 10 }}>
            {data.map((r) => (
              <Card key={r.id} className="card-pad row">
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tab === "suggestions" ? r.body : sc.title(r)}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                    {tab === "suggestions" ? `${r.category} · ${r.status || ""} · ${fmtDate(r.created_at)}` : (r.created_at ? fmtDate(r.created_at) : "")}
                  </div>
                </div>
                {tab !== "suggestions" && (
                  <>
                    <button className="iconbtn" style={{ width: 38, height: 38, color: "var(--navy)" }} onClick={() => setEditing(r)}><IcEdit size={20} /></button>
                    <button className="iconbtn" style={{ width: 38, height: 38, color: "var(--red)" }} onClick={() => del(r.id)}><IcTrash size={20} /></button>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <Editor table={tab} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
    </div>
  );
}
