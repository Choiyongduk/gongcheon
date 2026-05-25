import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import TopBar from "../../components/TopBar";
import { Card, Loading, fmtDate } from "../../components/ui";
import { IcPlus, IcEdit, IcTrash } from "../../components/Icons";
import { useAuth } from "../../context/AuthContext";
import { useCollection } from "../../lib/useData";
import { supabase, hasSupabase } from "../../lib/supabase";
import { SCHEMA, TABS, RecordEditor } from "../../components/RecordEditor";
import Approvals from "./Approvals";

const ALL_TABS = [...TABS, "approvals"];
const TAB_LABEL = { approvals: "가입승인" };

export default function Admin() {
  const { isAdmin, ready } = useAuth();
  const [tab, setTab] = useState("notices");
  const [editing, setEditing] = useState(null);
  const { data, loading, reload } = useCollection(tab);

  if (!ready) return <Loading />;
  if (!hasSupabase) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/login" replace />;

  const isApprovals = tab === "approvals";
  const sc = isApprovals ? null : SCHEMA[tab];
  const del = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await supabase.from(tab).delete().eq("id", id);
    reload();
  };

  return (
    <div className="page">
      <TopBar title="관리자" right={
        isApprovals ? null : <button className="iconbtn" onClick={() => setEditing({})} aria-label="추가"><IcPlus size={24} /></button>
      } />
      <div style={{ position: "relative", borderBottom: "1px solid var(--line)" }}>
        <div className="tabscroll" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "12px 14px", scrollbarWidth: "thin" }}>
          {ALL_TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, background: tab === t ? "var(--navy)" : "#fff", color: tab === t ? "#fff" : "var(--muted)", boxShadow: tab === t ? "none" : "inset 0 0 0 1px var(--line)" }}>
              {TAB_LABEL[t] || SCHEMA[t].label}
            </button>
          ))}
        </div>
        <div aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 36, pointerEvents: "none", background: "linear-gradient(90deg, rgba(251,250,242,0), var(--paper))" }} />
      </div>

      <div style={{ padding: 16 }}>
        {isApprovals ? <Approvals /> : loading ? <Loading /> : (
          <div className="stack" style={{ gap: 10 }}>
            {data.map((r) => (
              <Card key={r.id} className="card-pad row">
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sc.title(r)}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>
                    {tab === "suggestions" ? `${r.category} · ${r.status || ""} · ${fmtDate(r.created_at)}` : (r.created_at ? fmtDate(r.created_at) : "")}
                  </div>
                </div>
                <button className="iconbtn" style={{ width: 38, height: 38, color: "var(--navy)" }} onClick={() => setEditing(r)}><IcEdit size={20} /></button>
                <button className="iconbtn" style={{ width: 38, height: 38, color: "var(--red)" }} onClick={() => del(r.id)}><IcTrash size={20} /></button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <RecordEditor table={tab} row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
    </div>
  );
}
