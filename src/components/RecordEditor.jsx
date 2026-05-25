import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Uploader, DocUpload } from "./Media";
import { useAuth } from "../context/AuthContext";
import { IcPlus } from "./Icons";

/* 콘텐츠 테이블별 입력 스키마 */
export const SCHEMA = {
  notices: {
    label: "공지", order: ["category", "title", "body", "attachments", "pinned", "created_at"],
    fields: {
      category: { t: "select", opts: ["성명", "공고", "안내"], label: "분류" },
      title: { t: "text", label: "제목" },
      body: { t: "area", label: "내용" },
      attachments: { t: "attach", label: "첨부 (유튜브·사진·파일·영상)" },
      pinned: { t: "bool", label: "상단 고정" },
      created_at: { t: "date", label: "날짜" },
    },
    title: (r) => r.title,
    defaults: { category: "안내", created_at: () => new Date().toISOString().slice(0, 10), attachments: [] },
  },
  minutes: {
    label: "회의록", order: ["round", "date", "place", "quorum", "agenda", "decided", "attachments"],
    fields: {
      round: { t: "num", label: "회차" },
      date: { t: "date", label: "일자" },
      place: { t: "text", label: "장소" },
      quorum: { t: "text", label: "의결정족수" },
      agenda: { t: "lines", label: "안건 (줄바꿈 구분)" },
      decided: { t: "area", label: "의결사항" },
      attachments: { t: "attach", label: "첨부 (유튜브·사진·파일·영상)" },
    },
    title: (r) => `제${r.round}차 회의`,
    defaults: { date: () => new Date().toISOString().slice(0, 10), attachments: [] },
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
    defaults: { phase: "upcoming", kind: "milestone" },
  },
  documents: {
    label: "자료", order: ["name", "upload", "filetype", "size", "created_at"],
    fields: {
      name: { t: "text", label: "자료명" },
      upload: { t: "docupload", label: "파일 (사진·문서·영상 직접 업로드)" },
      filetype: { t: "select", opts: ["PDF", "HWP", "DOCX", "XLSX", "PPTX", "ZIP", "image", "video"], label: "형식" },
      size: { t: "text", label: "용량" },
      created_at: { t: "date", label: "날짜" },
    },
    title: (r) => r.name,
    defaults: { filetype: "PDF", created_at: () => new Date().toISOString().slice(0, 10) },
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
    defaults: { sort: 100 },
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
    defaults: { sort: 100 },
  },
  suggestions: {
    label: "개선의견", order: ["category", "body", "status", "attachments"],
    fields: {
      category: { t: "select", opts: ["절차", "심사기준", "운영", "기타"], label: "분류" },
      body: { t: "area", label: "내용" },
      status: { t: "select", opts: ["검토중", "반영", "보류"], label: "상태" },
      attachments: { t: "attach", label: "첨부 (유튜브·사진·파일)" },
    },
    title: (r) => r.body,
    defaults: { category: "절차", status: "검토중", attachments: [] },
  },
};

export const TABS = ["notices", "minutes", "events", "documents", "members", "rules", "suggestions"];

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

export function RecordEditor({ table, row, onClose, onSaved }) {
  const sc = SCHEMA[table];
  const [form, setForm] = useState(() => {
    const f = { ...row };
    // apply defaults for new records
    if (!f.id && sc.defaults) {
      for (const [k, v] of Object.entries(sc.defaults)) {
        if (f[k] === undefined) f[k] = typeof v === "function" ? v() : v;
      }
    }
    if (Array.isArray(f.agenda)) f.agenda = f.agenda.join("\n");
    return f;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setBusy(true); setErr("");
    const payload = { ...form };
    if (table === "minutes" && typeof payload.agenda === "string")
      payload.agenda = payload.agenda.split("\n").map((s) => s.trim()).filter(Boolean);
    delete payload.upload;
    delete payload.id;
    const res = row.id
      ? await supabase.from(table).update(payload).eq("id", row.id)
      : await supabase.from(table).insert(payload);
    setBusy(false);
    if (res.error) { setErr(res.error.message); return; }
    onSaved();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,28,76,0.45)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--paper)", width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", borderRadius: "20px 20px 0 0", padding: 20, paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
        <div className="display" style={{ fontSize: 18, color: "var(--navy)", marginBottom: 16 }}>
          {row.id ? "수정" : "새로 작성"} · {sc.label}
        </div>
        {sc.order.map((k) => {
          const def = sc.fields[k];
          return (
            <div key={k} style={{ marginBottom: 13 }}>
              <label className="label">{def.label}</label>
              {def.t === "attach" ? (
                <Uploader value={form[k]} onChange={(v) => setForm((f) => ({ ...f, [k]: v }))} />
              ) : def.t === "docupload" ? (
                <DocUpload form={form} onPatch={(patch) => setForm((f) => ({ ...f, ...patch }))} />
              ) : (
                <Field def={def} value={form[k]} onChange={(v) => setForm((f) => ({ ...f, [k]: v }))} />
              )}
            </div>
          );
        })}
        {err && <div style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 10, lineHeight: 1.5 }}>{err}</div>}
        <button className="btn btn-red" onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</button>
        <button className="btn btn-ghost" style={{ marginTop: 9 }} onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

/* 로그인 사용자에게만 보이는 "작성" 버튼 + 에디터 */
export function WriteButton({ table, label = "작성", onSaved }) {
  const { user, hasSupabase } = useAuth();
  const [open, setOpen] = useState(false);
  if (!hasSupabase || !user) return null;
  return (
    <>
      <button
        className="btn btn-red"
        style={{ width: "auto", padding: "9px 16px", fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6 }}
        onClick={() => setOpen(true)}
      >
        <IcPlus size={17} /> {label}
      </button>
      {open && (
        <RecordEditor
          table={table}
          row={{}}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); onSaved && onSaved(); }}
        />
      )}
    </>
  );
}

/* 오른쪽 아래 떠있는 + 버튼 (로그인 사용자에게만). 하단 탭 위에 위치 */
export function WriteFab({ table, onSaved, label = "작성" }) {
  const { user, hasSupabase } = useAuth();
  const [open, setOpen] = useState(false);
  if (!hasSupabase || !user) return null;
  return (
    <>
      <div style={{ position: "fixed", left: 0, right: 0, maxWidth: 440, margin: "0 auto", bottom: "calc(80px + env(safe-area-inset-bottom))", pointerEvents: "none", zIndex: 25 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 18px" }}>
          <button
            onClick={() => setOpen(true)}
            aria-label={label}
            style={{ pointerEvents: "auto", width: 54, height: 54, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--red)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 26px rgba(165,0,52,0.4)" }}
          >
            <IcPlus size={26} />
          </button>
        </div>
      </div>
      {open && (
        <RecordEditor
          table={table}
          row={{}}
          onClose={() => setOpen(false)}
          onSaved={() => { setOpen(false); onSaved && onSaved(); }}
        />
      )}
    </>
  );
}
