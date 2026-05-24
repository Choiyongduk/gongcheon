import React from "react";
import { useNavigate } from "react-router-dom";
import { Symbol, FullLogo } from "../components/Logo";
import { SectionHead, Card, Badge, fmtDate } from "../components/ui";
import { useCollection } from "../lib/useData";
import {
  IcMembers, IcBell, IcScale, IcArchive, IcCalendar, IcDoc, IcBulb, IcVote,
} from "../components/Icons";

const SHORTCUTS = [
  { to: "/members", label: "위원", desc: "위원회 구성", Ic: IcMembers },
  { to: "/notices", label: "공지", desc: "공지·성명", Ic: IcBell },
  { to: "/rules", label: "규칙", desc: "공천 규정", Ic: IcScale },
  { to: "/archive", label: "회의록", desc: "회의 기록", Ic: IcArchive },
  { to: "/schedule", label: "일정", desc: "공천 로드맵", Ic: IcCalendar },
  { to: "/archive", label: "자료실", desc: "양식·문서", Ic: IcDoc },
  { to: "/suggestions", label: "개선의견", desc: "의견 접수", Ic: IcBulb },
];

export default function Home() {
  const nav = useNavigate();
  const { data: notices } = useCollection("notices");
  const { data: events } = useCollection("events");

  const top = notices[0];
  const next =
    events.find((e) => e.phase === "active") ||
    events.find((e) => e.phase === "upcoming") ||
    events[events.length - 1];

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="brandbar">
        <FullLogo height={30} />
        <div style={{ height: 22, width: 1, background: "var(--line)", margin: "0 2px" }} />
        <div className="brand-sub" style={{ marginTop: 0, fontSize: 12 }}>공천관리위원회</div>
      </div>

      <div style={{ padding: "8px 18px 24px" }}>
        {/* HERO */}
        <Card className="lux fade" style={{ padding: "22px 20px 18px", border: "none" }}>
          <span className="goldline" />
          <div style={{ position: "absolute", right: -10, top: -2, opacity: 0.9 }}>
            <Symbol size={150} white style={{ opacity: 0.12 }} />
          </div>
          <span className="badge outline-light">제9회 전국동시지방선거</span>
          <h1 className="display" style={{ margin: "13px 0 6px", fontSize: 25, lineHeight: 1.25 }}>
            공천관리위원회
          </h1>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.82 }}>
            공정 · 투명 · 전문성으로 신뢰받는 공천
          </p>

          {next && (
            <div
              onClick={() => nav("/schedule")}
              style={{
                marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 14, padding: "12px 14px", cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>다음 일정</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{next.title}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>일자</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#ffd2dd" }}>{fmtDate(next.date)}</div>
              </div>
            </div>
          )}
        </Card>

        {/* LATEST NOTICE */}
        {top && (
          <div className="fade" style={{ marginTop: 22, animationDelay: ".05s" }}>
            <SectionHead kicker="Notice" title="최근 공지" />
            <Card className="card-pad tap" onClick={() => nav("/notice/" + top.id)}>
              <div className="row" style={{ marginBottom: 8 }}>
                <Badge tone={top.category === "성명" ? "red" : "navy"}>{top.category}</Badge>
                <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(top.created_at)}</span>
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.4 }}>{top.title}</div>
            </Card>
          </div>
        )}

        {/* SHORTCUTS */}
        <div className="fade" style={{ marginTop: 24, animationDelay: ".1s" }}>
          <SectionHead kicker="Menu" title="바로가기" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {SHORTCUTS.map((s, i) => (
              <Card key={i} className="card-pad tap" onClick={() => nav(s.to)} style={{ padding: 15 }}>
                <span style={{ color: "var(--red)", display: "inline-flex" }}><s.Ic size={24} /></span>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--navy)", marginTop: 10 }}>{s.label}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.desc}</div>
              </Card>
            ))}
            <Card className="card-pad lux" onClick={() => nav("/committee")} style={{ padding: 15, border: "none", cursor: "pointer" }}>
              <span className="goldline" />
              <span style={{ display: "inline-flex" }}><IcVote size={24} /></span>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginTop: 10 }}>위원회</div>
              <div style={{ fontSize: 12, marginTop: 2, opacity: 0.8 }}>구성·규칙·의견</div>
            </Card>
          </div>
        </div>

        <hr className="hair" style={{ margin: "26px 0 14px" }} />
        <p className="center muted" style={{ fontSize: 11, lineHeight: 1.7 }}>
          자유와혁신 공천관리위원회 · 내부용<br />
          데이터는 위원회 운영자가 관리합니다.
        </p>
      </div>
    </div>
  );
}
