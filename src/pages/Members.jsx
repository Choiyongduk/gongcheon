import React from "react";
import TopBar from "../components/TopBar";
import { Card, Badge, Loading } from "../components/ui";
import { useCollection } from "../lib/useData";

export default function Members() {
  const { data, loading } = useCollection("members");
  return (
    <div className="page">
      <TopBar title="위원" />
      <div style={{ padding: 18 }}>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.6 }}>
          재적 8인의 위원과 의결권 없는 간사로 구성됩니다.
        </p>
        {loading ? (
          <Loading />
        ) : (
          <div className="stack" style={{ gap: 11 }}>
            {data.map((m, i) => (
              <Card
                key={m.id}
                className="card-pad row fade"
                style={{ animationDelay: `${i * 0.03}s`, borderLeft: m.lead ? "3px solid var(--red)" : undefined }}
              >
                <div
                  style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                    background: m.lead ? "var(--red)" : m.role === "간사" ? "#8a8270" : "var(--navy)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 17, fontFamily: "var(--serif)",
                  }}
                >
                  {m.name.charAt(0)}
                </div>
                <div className="grow">
                  <div className="row" style={{ gap: 7 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>{m.name}</span>
                    <Badge tone={m.lead ? "red" : m.role === "간사" ? "gold" : "navy"}>{m.role}</Badge>
                  </div>
                  {(m.org || m.note) && (
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                      {[m.org, m.note].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
