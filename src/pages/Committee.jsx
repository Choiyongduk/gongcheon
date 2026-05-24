import React from "react";
import { useNavigate } from "react-router-dom";
import { SectionHead, Card } from "../components/ui";
import { IcMembers, IcScale, IcBulb, IcChevron, IcLock, IcLogout, IcEdit } from "../components/Icons";
import { useAuth } from "../context/AuthContext";

const ITEMS = [
  { to: "/members", label: "위원", desc: "위원회 구성과 명단", Ic: IcMembers },
  { to: "/rules", label: "규칙", desc: "공천관리위원회 운영 규정", Ic: IcScale },
  { to: "/suggestions", label: "개선의견", desc: "절차·운영 의견 접수", Ic: IcBulb },
];

export default function Committee() {
  const nav = useNavigate();
  const { user, isAdmin, hasSupabase, signOut } = useAuth();

  return (
    <div className="page">
      <div style={{ padding: 18 }}>
        <SectionHead kicker="Committee" title="위원회" />
        <div className="stack" style={{ gap: 11 }}>
          {ITEMS.map((it) => (
            <Card key={it.to} className="card-pad row tap" onClick={() => nav(it.to)}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: "#f4f1e6", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <it.Ic size={22} />
              </span>
              <div className="grow">
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>{it.label}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{it.desc}</div>
              </div>
              <span className="chev" style={{ display: "inline-flex" }}><IcChevron size={20} /></span>
            </Card>
          ))}
        </div>

        {hasSupabase && (
          <>
            <hr className="hair" style={{ margin: "24px 0 14px" }} />
            <div className="kicker" style={{ marginBottom: 10 }}>운영</div>
            {isAdmin && (
              <Card className="card-pad row tap" onClick={() => nav("/admin")} style={{ marginBottom: 10 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--soft)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IcEdit size={22} />
                </span>
                <div className="grow">
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>관리자</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>공지·회의록·일정·자료 관리</div>
                </div>
                <span className="chev" style={{ display: "inline-flex" }}><IcChevron size={20} /></span>
              </Card>
            )}
            {user ? (
              <Card className="card-pad row tap" onClick={signOut}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: "#f1efe6", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IcLogout size={22} />
                </span>
                <div className="grow">
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>로그아웃</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{user.email}</div>
                </div>
              </Card>
            ) : (
              <Card className="card-pad row tap" onClick={() => nav("/login")}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: "#eef1f7", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IcLock size={22} />
                </span>
                <div className="grow">
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>위원·운영자 로그인</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>관리 기능 사용</div>
                </div>
                <span className="chev" style={{ display: "inline-flex" }}><IcChevron size={20} /></span>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
