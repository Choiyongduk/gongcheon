import React, { useState } from "react";
import TopBar from "../components/TopBar";
import { Loading } from "../components/ui";
import { IcChevDown } from "../components/Icons";
import { useCollection } from "../lib/useData";

export default function Rules() {
  const { data, loading } = useCollection("rules");
  const [open, setOpen] = useState(null);

  return (
    <div className="page">
      <TopBar title="규칙" />
      <div style={{ padding: 18 }}>
        <p className="muted" style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.6 }}>
          공천관리위원회 운영 규정
        </p>
        {loading ? (
          <Loading />
        ) : (
          <div className="stack" style={{ gap: 9 }}>
            {data.map((r, i) => {
              const isOpen = open === r.id || (open === null && i === 0);
              return (
                <div key={r.id} className="card" style={{ overflow: "hidden" }}>
                  <div
                    className="row"
                    style={{ padding: "14px 15px", cursor: "pointer", gap: 10 }}
                    onClick={() => setOpen(isOpen ? "none" : r.id)}
                  >
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--red)", minWidth: 40 }}>{r.no}</span>
                    <span className="grow" style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{r.title}</span>
                    <span style={{ color: "var(--muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: ".2s", display: "inline-flex" }}>
                      <IcChevDown size={18} />
                    </span>
                  </div>
                  {isOpen && (
                    <>
                      <hr className="hair" style={{ margin: "0 15px" }} />
                      <div style={{ padding: "13px 15px 16px", fontSize: 14, lineHeight: 1.8, color: "var(--ink)" }}>
                        {r.body}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
