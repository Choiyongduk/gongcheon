import React, { useState } from "react";
import TopBar from "../components/TopBar";
import { Card, Badge, Loading, fmtDate } from "../components/ui";
import { IcCheck } from "../components/Icons";
import { useCollection } from "../lib/useData";
import { supabase, hasSupabase } from "../lib/supabase";

const CATS = ["절차", "심사기준", "운영", "기타"];

export default function Suggestions() {
  const { data, loading, reload } = useCollection("suggestions");
  const [cat, setCat] = useState("절차");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState([]); // offline fallback list

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    const row = { category: cat, body: body.trim(), status: "검토중", created_at: new Date().toISOString() };
    if (hasSupabase) {
      await supabase.from("suggestions").insert(row);
      await reload();
    } else {
      setLocal((l) => [{ id: "loc" + Date.now(), ...row }, ...l]);
    }
    setBody("");
    setBusy(false);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  const list = [...local, ...data];

  return (
    <div className="page">
      <TopBar title="개선의견" />
      <div style={{ padding: 18 }}>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.6 }}>
          공천 절차·운영에 대한 의견을 남겨 주세요. 위원회가 검토합니다.
        </p>

        <Card className="card-pad" style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: cat === c ? "var(--red)" : "#f1efe6", color: cat === c ? "#fff" : "var(--muted)" }}>
                {c}
              </button>
            ))}
          </div>
          <textarea className="textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="의견을 입력하세요" />
          <button className="btn btn-red" style={{ marginTop: 10, background: done ? "var(--navy)" : "var(--red)" }} onClick={submit} disabled={busy}>
            {done ? (<span className="row" style={{ justifyContent: "center", gap: 6 }}><IcCheck size={18} /> 접수되었습니다</span>) : busy ? "제출 중…" : "의견 제출"}
          </button>
        </Card>

        <div className="row" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--navy)" }}>접수된 의견</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--red)", marginLeft: 6 }}>{list.length}</span>
        </div>
        {loading ? <Loading /> : (
          <div className="stack" style={{ gap: 11 }}>
            {list.map((s) => (
              <Card key={s.id} className="card-pad">
                <div className="row" style={{ marginBottom: 7 }}>
                  <Badge tone="navy">{s.category}</Badge>
                  {s.status && <Badge tone="gold">{s.status}</Badge>}
                  <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(s.created_at)}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s.body}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
