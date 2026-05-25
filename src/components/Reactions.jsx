import React, { useEffect, useState } from "react";
import { supabase, hasSupabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { IcHeart, IcSend, IcTrash } from "./Icons";
import { fmtDate } from "./ui";

export default function Reactions({ table, id, compact = false }) {
  const { user, isApproved, isAdmin, displayName } = useAuth();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(!compact);

  const liked = user && likes.some((l) => l.user_id === user.id);

  async function load() {
    if (!hasSupabase) return;
    const [l, c] = await Promise.all([
      supabase.from("likes").select("*").eq("target_table", table).eq("target_id", id),
      supabase.from("comments").select("*").eq("target_table", table).eq("target_id", id).order("created_at", { ascending: true }),
    ]);
    setLikes(l.data || []);
    setComments(c.data || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table, id]);

  const toggleLike = async () => {
    if (!hasSupabase || !isApproved || busy) return;
    setBusy(true);
    if (liked) {
      await supabase.from("likes").delete().eq("target_table", table).eq("target_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ target_table: table, target_id: id, user_id: user.id });
    }
    await load();
    setBusy(false);
  };

  const addComment = async () => {
    if (!hasSupabase || !isApproved || !text.trim() || busy) return;
    setBusy(true);
    await supabase.from("comments").insert({
      target_table: table, target_id: id, user_id: user.id, name: displayName, body: text.trim(),
    });
    setText("");
    await load();
    setBusy(false);
  };

  const delComment = async (cid) => {
    await supabase.from("comments").delete().eq("id", cid);
    await load();
  };

  if (!hasSupabase) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <hr className="hair" style={{ marginBottom: 14 }} />
      <div className="row" style={{ gap: 16 }}>
        <button onClick={toggleLike} disabled={!isApproved}
          className="row" style={{ gap: 6, background: "none", border: "none", cursor: isApproved ? "pointer" : "default", padding: 0, color: liked ? "var(--red)" : "var(--muted)" }}>
          <IcHeart size={20} fill={liked ? "var(--red)" : "none"} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{likes.length}</span>
        </button>
        <button onClick={() => setOpen((v) => !v)}
          className="row" style={{ gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--muted)" }}>
          <IcSend size={18} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>댓글 {comments.length}</span>
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div className="stack" style={{ gap: 10, marginBottom: comments.length ? 14 : 0 }}>
            {comments.map((c) => (
              <div key={c.id} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, fontFamily: "var(--serif)" }}>
                  {(c.name || "?").charAt(0)}
                </div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)" }}>{c.name || "익명"}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{fmtDate(c.created_at)}</span>
                    {(isAdmin || (user && c.user_id === user.id)) && (
                      <button onClick={() => delComment(c.id)} className="iconbtn" style={{ width: 26, height: 26, marginLeft: "auto", color: "var(--muted)" }}><IcTrash size={15} /></button>
                    )}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 2, whiteSpace: "pre-wrap" }}>{c.body}</div>
                </div>
              </div>
            ))}
          </div>

          {isApproved ? (
            <div className="row" style={{ gap: 8 }}>
              <input className="input" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="댓글 입력" onKeyDown={(e) => e.key === "Enter" && addComment()} />
              <button className="iconbtn" style={{ width: 44, height: 44, background: "var(--red)", color: "#fff", borderRadius: 12, flexShrink: 0 }} onClick={addComment} disabled={busy}>
                <IcSend size={20} />
              </button>
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 12.5 }}>댓글과 좋아요는 승인된 사용자만 작성할 수 있습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}
