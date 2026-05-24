import React, { useState, useMemo } from "react";
import { SectionHead, Card, Badge, Loading, fmtDate } from "../components/ui";
import { IcChevron, IcBack, IcChevDown } from "../components/Icons";
import { useCollection } from "../lib/useData";
import TopBar from "../components/TopBar";

const PHASE = {
  done: { label: "완료", tone: "gray" },
  active: { label: "진행중", tone: "red" },
  upcoming: { label: "예정", tone: "navy" },
};
const KIND_COLOR = {
  election: "var(--red)", milestone: "var(--navy)", meeting: "var(--gold)", process: "#7a8aad",
};
const WD = ["일", "월", "화", "수", "목", "금", "토"];

function Calendar({ events }) {
  const today = new Date();
  const [cur, setCur] = useState(() => {
    // default to month with the nearest upcoming/active event, else today
    const up = events.find((e) => e.phase !== "done");
    const base = up ? new Date(up.date) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === cur.getFullYear() && d.getMonth() === cur.getMonth()) {
        (map[d.getDate()] ||= []).push(e);
      }
    });
    return map;
  }, [events, cur]);

  const first = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
  const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthEvents = Object.entries(byDay).sort((a, b) => a[0] - b[0]);

  const move = (d) => setCur(new Date(cur.getFullYear(), cur.getMonth() + d, 1));

  return (
    <Card className="card-pad" style={{ padding: 16 }}>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={() => move(-1)}><IcBack size={20} /></button>
        <div className="grow center display" style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
          {cur.getFullYear()}. {String(cur.getMonth() + 1).padStart(2, "0")}
        </div>
        <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={() => move(1)}><IcChevron size={20} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {WD.map((w, i) => (
          <div key={w} className="center" style={{ fontSize: 11, fontWeight: 800, padding: "4px 0", color: i === 0 ? "var(--red)" : i === 6 ? "var(--navy)" : "var(--muted)" }}>
            {w}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((d, i) => {
          const evs = d ? byDay[d] : null;
          const isToday = d && today.getFullYear() === cur.getFullYear() && today.getMonth() === cur.getMonth() && today.getDate() === d;
          return (
            <div key={i} className="center" style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 9, position: "relative", background: isToday ? "var(--soft)" : "transparent" }}>
              {d && (
                <>
                  <span style={{ fontSize: 12.5, fontWeight: evs ? 800 : 500, color: i % 7 === 0 ? "var(--red)" : "var(--ink)" }}>{d}</span>
                  {evs && (
                    <span style={{ display: "flex", gap: 2, marginTop: 3 }}>
                      {evs.slice(0, 3).map((e, k) => (
                        <span key={k} style={{ width: 5, height: 5, borderRadius: "50%", background: KIND_COLOR[e.kind] || "var(--navy)" }} />
                      ))}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {monthEvents.length > 0 && (
        <>
          <hr className="hair" style={{ margin: "14px 0" }} />
          <div className="stack" style={{ gap: 9 }}>
            {monthEvents.map(([day, evs]) =>
              evs.map((e, k) => (
                <div key={e.id + k} className="row" style={{ gap: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: KIND_COLOR[e.kind] || "var(--navy)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--navy)", minWidth: 30 }}>{day}일</span>
                  <span className="grow" style={{ fontSize: 13.5 }}>{e.title}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function Roadmap({ events }) {
  const [showPast, setShowPast] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const up = [], pa = [];
    for (const e of events) {
      const d = new Date(e.date);
      if (e.phase === "done" || (e.phase !== "active" && d < today)) pa.push(e);
      else up.push(e);
    }
    up.sort((a, b) => new Date(a.date) - new Date(b.date)); // 가까운 순
    pa.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신순
    return { upcoming: up, past: pa };
  }, [events]);

  const Item = (e) => {
    const p = PHASE[e.phase] || PHASE.upcoming;
    const active = e.phase === "active";
    return (
      <div key={e.id} className="row fade" style={{ alignItems: "stretch", gap: 14, marginBottom: 12 }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%", marginTop: 4, flexShrink: 0, zIndex: 1,
          background: e.phase === "done" ? "var(--muted)" : active ? "var(--red)" : "#fff",
          border: `3px solid ${e.phase === "upcoming" ? "var(--line)" : active ? "var(--red)" : "var(--muted)"}`,
          boxShadow: active ? "0 0 0 5px var(--soft)" : "none",
        }} />
        <Card className="grow" style={{ padding: "13px 15px", background: active ? "var(--soft)" : "var(--card)", border: active ? "1px solid #f1c9d3" : undefined }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{e.title}</span>
            <span style={{ marginLeft: "auto" }}><Badge tone={p.tone}>{p.label}</Badge></span>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>{fmtDate(e.date)}</div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ position: "relative", paddingLeft: 6 }}>
      <div className="kicker" style={{ marginBottom: 12 }}>다가오는 일정</div>
      {upcoming.length === 0 ? (
        <div className="muted" style={{ fontSize: 13, padding: "4px 0 16px" }}>예정된 일정이 없습니다.</div>
      ) : upcoming.map(Item)}

      {past.length > 0 && (
        <>
          <button
            onClick={() => setShowPast((v) => !v)}
            className="btn btn-ghost"
            style={{ marginTop: 6, padding: "11px 0", fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <IcChevDown size={17} style={{ transform: showPast ? "rotate(180deg)" : "none", transition: ".2s" }} />
            지난 일정 {past.length}개 {showPast ? "접기" : "보기"}
          </button>
          {showPast && (
            <div style={{ marginTop: 14 }}>
              <div className="kicker" style={{ marginBottom: 12, color: "var(--muted)" }}>지난 일정</div>
              {past.map(Item)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Schedule() {
  const { data, loading } = useCollection("events");
  const [view, setView] = useState("calendar");

  return (
    <div className="page">
      <TopBar title="공천 일정" />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["calendar", "캘린더"], ["roadmap", "로드맵"]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className="btn"
              style={{ padding: "10px 0", fontSize: 14, background: view === k ? "var(--navy)" : "#fff", color: view === k ? "#fff" : "var(--muted)", boxShadow: view === k ? "var(--shadow)" : "inset 0 0 0 1px var(--line)" }}>
              {l}
            </button>
          ))}
        </div>
        {loading ? <Loading /> : view === "calendar" ? <Calendar events={data} /> : <Roadmap events={data} />}
      </div>
    </div>
  );
}
