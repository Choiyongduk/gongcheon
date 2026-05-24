import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Card, Badge, SectionHead, Empty, Loading, fmtDate } from "../components/ui";
import { IcPin } from "../components/Icons";
import { useCollection } from "../lib/useData";

const tone = (c) => (c === "성명" ? "red" : c === "공고" ? "gold" : "navy");

export function Notices() {
  const nav = useNavigate();
  const { data, loading } = useCollection("notices");
  return (
    <div className="page">
      <div style={{ padding: 18 }}>
        <SectionHead kicker="Notice" title="공지사항" />
        {loading ? (
          <Loading />
        ) : data.length === 0 ? (
          <Empty>등록된 공지가 없습니다.</Empty>
        ) : (
          <div className="stack" style={{ gap: 11 }}>
            {data.map((n, i) => (
              <Card key={n.id} className="card-pad tap fade" onClick={() => nav("/notice/" + n.id)} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="row" style={{ marginBottom: 8 }}>
                  {n.pinned && <span style={{ color: "var(--red)", display: "inline-flex" }}><IcPin size={15} /></span>}
                  <Badge tone={tone(n.category)}>{n.category}</Badge>
                  <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(n.created_at)}</span>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.4 }}>{n.title}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function NoticeDetail() {
  const { id } = useParams();
  const { data } = useCollection("notices");
  const n = data.find((x) => x.id === id);
  return (
    <div className="page">
      <TopBar title="공지사항" />
      {!n ? (
        <Empty>공지를 찾을 수 없습니다.</Empty>
      ) : (
        <div style={{ padding: 18 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <Badge tone={tone(n.category)}>{n.category}</Badge>
            <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(n.created_at)}</span>
          </div>
          <h1 className="display" style={{ margin: "0 0 16px", fontSize: 21, color: "var(--navy)", lineHeight: 1.4 }}>
            {n.title}
          </h1>
          <hr className="hair" style={{ marginBottom: 18 }} />
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{n.body}</p>
        </div>
      )}
    </div>
  );
}
