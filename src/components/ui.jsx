import React from "react";

export function SectionHead({ kicker, title }) {
  return (
    <div className="section-head">
      {kicker && (
        <div>
          <span className="line" />
          <span className="kicker">{kicker}</span>
        </div>
      )}
      <h2>{title}</h2>
    </div>
  );
}

export function Card({ children, onClick, className = "", style }) {
  return (
    <div
      className={`card ${onClick ? "tap" : ""} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "navy" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Empty({ children }) {
  return (
    <div className="center muted" style={{ padding: "48px 20px", fontSize: 14 }}>
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="center muted" style={{ padding: "60px 0", fontSize: 13 }}>
      불러오는 중…
    </div>
  );
}

export const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
};
