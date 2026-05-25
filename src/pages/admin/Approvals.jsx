import React, { useEffect, useState } from "react";
import { Card, Badge, Loading, Empty, fmtDate } from "../../components/ui";
import { IcCheck } from "../../components/Icons";
import { supabase } from "../../lib/supabase";

export default function Approvals() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  const patch = async (id, fields) => {
    setBusy(id);
    await supabase.from("profiles").update(fields).eq("id", id);
    await load();
    setBusy("");
  };

  if (rows === null) return <Loading />;
  if (rows.length === 0) return <Empty>가입한 사용자가 없습니다.</Empty>;

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((p) => {
        const approved = p.status === "approved" || p.role === "admin";
        return (
          <Card key={p.id} className="card-pad">
            <div className="row" style={{ gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{p.name || "이름 없음"}</span>
              {p.role === "admin" && <Badge tone="red">관리자</Badge>}
              <Badge tone={approved ? "navy" : "gold"}>{approved ? "승인됨" : "대기중"}</Badge>
              <span className="muted" style={{ fontSize: 11, marginLeft: "auto" }}>{fmtDate(p.created_at)}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!approved ? (
                <button className="btn btn-red" style={{ padding: "9px 0", fontSize: 13 }} disabled={busy === p.id}
                  onClick={() => patch(p.id, { status: "approved" })}>
                  <span className="row" style={{ justifyContent: "center", gap: 5 }}><IcCheck size={16} /> 승인</span>
                </button>
              ) : (
                <button className="btn btn-ghost" style={{ padding: "9px 0", fontSize: 13 }} disabled={busy === p.id}
                  onClick={() => patch(p.id, { status: "pending" })}>승인 취소</button>
              )}
              {p.role === "admin" ? (
                <button className="btn btn-ghost" style={{ padding: "9px 0", fontSize: 13 }} disabled={busy === p.id}
                  onClick={() => patch(p.id, { role: "member" })}>관리자 해제</button>
              ) : (
                <button className="btn btn-navy" style={{ padding: "9px 0", fontSize: 13 }} disabled={busy === p.id}
                  onClick={() => patch(p.id, { role: "admin", status: "approved" })}>관리자 지정</button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
