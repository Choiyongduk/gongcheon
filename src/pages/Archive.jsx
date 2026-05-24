import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Card, Badge, SectionHead, Loading, Empty, fmtDate } from "../components/ui";
import { IcDoc, IcDown } from "../components/Icons";
import { Attachments } from "../components/Media";
import { WriteButton } from "../components/RecordEditor";
import { useCollection } from "../lib/useData";

export function Archive() {
  const nav = useNavigate();
  const [tab, setTab] = useState("minutes");
  const { data: minutes, loading: lm, reload: rm } = useCollection("minutes");
  const { data: docs, loading: ld, reload: rd } = useCollection("documents");

  return (
    <div className="page">
      <TopBar title="회의 · 자료" right={
        tab === "minutes"
          ? <WriteButton table="minutes" label="작성" onSaved={rm} />
          : <WriteButton table="documents" label="추가" onSaved={rd} />
      } />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["minutes", "회의록"], ["docs", "자료실"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="btn"
              style={{
                padding: "11px 0", fontSize: 14,
                background: tab === k ? "var(--navy)" : "#fff",
                color: tab === k ? "#fff" : "var(--muted)",
                boxShadow: tab === k ? "var(--shadow)" : "inset 0 0 0 1px var(--line)",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "minutes" ? (
          lm ? <Loading /> : minutes.length === 0 ? <Empty>회의록이 없습니다.</Empty> : (
            <div className="stack" style={{ gap: 11 }}>
              {minutes.map((m, i) => (
                <Card key={m.id} className="card-pad tap fade" onClick={() => nav("/minute/" + m.id)} style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)", fontFamily: "var(--serif)" }}>
                      제{m.round}차 회의
                    </span>
                    <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(m.date)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{m.place} · {m.quorum}</div>
                  <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>
                    <b style={{ color: "var(--red)" }}>안건 </b>
                    {(m.agenda || []).join(" · ")}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          ld ? <Loading /> : docs.length === 0 ? <Empty>자료가 없습니다.</Empty> : (
            <div className="stack" style={{ gap: 11 }}>
              {docs.map((d, i) => (
                <Card key={d.id} className="card-pad row tap fade" style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => d.url && d.url !== "#" && window.open(d.url, "_blank")}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: d.filetype === "PDF" ? "var(--soft)" : "#eef1f7",
                    color: d.filetype === "PDF" ? "var(--red)" : "var(--navy)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <IcDoc size={20} />
                  </div>
                  <div className="grow">
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{d.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {d.filetype} · {d.size} · {fmtDate(d.created_at)}
                    </div>
                  </div>
                  <span style={{ color: "var(--red)", display: "inline-flex" }}><IcDown size={20} /></span>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function MinuteDetail() {
  const { id } = useParams();
  const { data } = useCollection("minutes");
  const m = data.find((x) => x.id === id);
  return (
    <div className="page">
      <TopBar title="회의록" />
      {!m ? <Empty>회의록을 찾을 수 없습니다.</Empty> : (
        <div style={{ padding: 18 }}>
          <Badge tone="navy">{fmtDate(m.date)}</Badge>
          <h1 className="display" style={{ margin: "12px 0 4px", fontSize: 23, color: "var(--navy)" }}>
            제{m.round}차 공천관리위원회 회의
          </h1>
          <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>{m.place} · {m.quorum}</div>

          <Card className="card-pad" style={{ marginBottom: 12 }}>
            <div className="kicker" style={{ marginBottom: 11 }}>안건</div>
            {(m.agenda || []).map((a, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", gap: 9, marginBottom: 8, fontSize: 14.5, lineHeight: 1.5 }}>
                <span style={{ color: "var(--red)", fontWeight: 800, fontFamily: "var(--serif)" }}>{i + 1}</span>
                <span>{a}</span>
              </div>
            ))}
          </Card>

          <Card className="lux card-pad" style={{ border: "none" }}>
            <span className="goldline" />
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: "#ffd2dd", marginBottom: 9 }}>
              의결사항
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.75 }}>{m.decided}</div>
          </Card>
          <Attachments items={m.attachments} />
        </div>
      )}
    </div>
  );
}
