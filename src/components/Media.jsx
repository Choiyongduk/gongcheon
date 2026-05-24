import React, { useState, useRef } from "react";
import { IcDoc, IcDown, IcPlus, IcTrash } from "./Icons";
import { uploadFile, youtubeId } from "../lib/upload";

/* ---------- 읽기: 첨부 렌더링 ---------- */
export function Attachments({ items }) {
  const list = items || [];
  if (!list.length) return null;
  const images = list.filter((a) => a.type === "image");
  const videos = list.filter((a) => a.type === "video");
  const yts = list.filter((a) => a.type === "youtube");
  const files = list.filter((a) => a.type === "file");

  return (
    <div className="stack" style={{ gap: 14, marginTop: 18 }}>
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr", gap: 8 }}>
          {images.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noreferrer">
              <img src={a.url} alt={a.name || ""} style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", display: "block" }} />
            </a>
          ))}
        </div>
      )}
      {videos.map((a, i) => (
        <video key={i} src={a.url} controls playsInline style={{ width: "100%", borderRadius: 12, background: "#000", border: "1px solid var(--line)" }} />
      ))}
      {yts.map((a, i) => {
        const id = youtubeId(a.url);
        return (
          <div key={i} style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              title="video" frameBorder="0" allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          </div>
        );
      })}
      {files.map((a, i) => (
        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="card card-pad row" style={{ textDecoration: "none" }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--soft)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IcDoc size={20} />
          </span>
          <div className="grow" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
            {a.size && <div className="muted" style={{ fontSize: 12 }}>{a.size}</div>}
          </div>
          <span style={{ color: "var(--red)", display: "inline-flex" }}><IcDown size={20} /></span>
        </a>
      ))}
    </div>
  );
}

/* ---------- 편집: 업로더 ---------- */
export function Uploader({ value, onChange }) {
  const list = value || [];
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [yt, setYt] = useState("");
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true); setErr("");
    try {
      const uploaded = [];
      for (const f of files) uploaded.push(await uploadFile(f, "attachments"));
      onChange([...list, ...uploaded]);
    } catch (e2) {
      setErr(e2.message || "업로드 실패");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addYt = () => {
    if (!youtubeId(yt)) { setErr("유효한 유튜브 링크가 아닙니다."); return; }
    onChange([...list, { type: "youtube", url: yt.trim(), name: "YouTube" }]);
    setYt(""); setErr("");
  };

  const remove = (i) => onChange(list.filter((_, k) => k !== i));

  return (
    <div>
      <input ref={inputRef} type="file" multiple accept="image/*,video/*,application/pdf,.hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" style={{ display: "none" }} onChange={onFiles} />
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1, padding: "11px 0", fontSize: 13.5 }} onClick={pick} disabled={busy}>
          {busy ? "업로드 중…" : "사진·파일·영상 추가"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input className="input" style={{ flex: 1 }} value={yt} onChange={(e) => setYt(e.target.value)} placeholder="유튜브 링크 붙여넣기" />
        <button type="button" className="iconbtn" style={{ width: 44, height: 44, background: "var(--navy)", color: "#fff", borderRadius: 12 }} onClick={addYt}><IcPlus size={20} /></button>
      </div>
      {err && <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{err}</div>}
      {list.length > 0 && (
        <div className="stack" style={{ gap: 6 }}>
          {list.map((a, i) => (
            <div key={i} className="row" style={{ gap: 8, padding: "8px 10px", background: "#fff", border: "1px solid var(--line)", borderRadius: 10 }}>
              {a.type === "image" ? (
                <img src={a.url} alt="" style={{ width: 34, height: 34, borderRadius: 7, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", width: 34, textAlign: "center" }}>
                  {a.type === "youtube" ? "YT" : a.type === "video" ? "VID" : "FILE"}
                </span>
              )}
              <span className="grow" style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
              <button type="button" className="iconbtn" style={{ width: 32, height: 32, color: "var(--red)" }} onClick={() => remove(i)}><IcTrash size={17} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- 편집: 자료실 단일 파일 업로더 ---------- */
export function DocUpload({ form, onPatch }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (e) => {
    const f = (e.target.files || [])[0];
    if (!f) return;
    setBusy(true); setErr("");
    try {
      const up = await uploadFile(f, "documents");
      const ext = (f.name.split(".").pop() || "").toUpperCase();
      onPatch({ url: up.url, size: up.size, filetype: ext || up.type, name: form.name || f.name });
    } catch (e2) {
      setErr(e2.message || "업로드 실패");
    }
    setBusy(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div>
      <input ref={ref} type="file" style={{ display: "none" }} onChange={onFile}
        accept="image/*,video/*,application/pdf,.hwp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" />
      <button type="button" className="btn btn-ghost" style={{ padding: "11px 0", fontSize: 13.5 }} onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? "업로드 중…" : form.url && form.url !== "#" ? "파일 교체 업로드" : "파일 업로드"}
      </button>
      {form.url && form.url !== "#" && (
        <div className="muted" style={{ fontSize: 12, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          업로드됨: {form.filetype} · {form.size}
        </div>
      )}
      {err && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>{err}</div>}
    </div>
  );
}
