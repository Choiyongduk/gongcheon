import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Card, Badge, Loading, Empty, fmtDate } from "../components/ui";
import { fetchFeed, getLastSeen, markSeen } from "../lib/notify";

const tone = { 공지: "red", 회의록: "navy", 자료: "gold", 개선의견: "gray" };

export default function Notifications() {
  const nav = useNavigate();
  const [feed, setFeed] = useState(null);
  const [seen] = useState(getLastSeen());

  useEffect(() => {
    fetchFeed().then((f) => { setFeed(f); markSeen(); });
  }, []);

  const seenTs = new Date(seen).getTime() || 0;

  return (
    <div className="page">
      <TopBar title="알림" />
      <div style={{ padding: 18 }}>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.6 }}>
          최근 올라온 공지·회의록·자료·개선의견입니다.
        </p>
        {feed === null ? <Loading /> : feed.length === 0 ? <Empty>새 소식이 없습니다.</Empty> : (
          <div className="stack" style={{ gap: 10 }}>
            {feed.map((it) => {
              const isNew = it.ts > seenTs;
              return (
                <Card key={it.type + it.id} className="card-pad tap row" onClick={() => nav(it.to)}
                  style={{ borderLeft: isNew ? "3px solid var(--red)" : undefined }}>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="row" style={{ gap: 7, marginBottom: 5 }}>
                      <Badge tone={tone[it.label] || "navy"}>{it.label}</Badge>
                      {isNew && <span style={{ fontSize: 11, fontWeight: 800, color: "var(--red)" }}>NEW</span>}
                      <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{fmtDate(it.when)}</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.title}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
