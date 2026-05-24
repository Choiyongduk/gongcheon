import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IcHome, IcBell, IcCalendar, IcArchive, IcCommittee } from "./Icons";

const TABS = [
  { key: "/", label: "홈", Ic: IcHome, match: ["/"] },
  { key: "/notices", label: "공지", Ic: IcBell, match: ["/notices", "/notice"] },
  { key: "/schedule", label: "일정", Ic: IcCalendar, match: ["/schedule"] },
  { key: "/archive", label: "회의·자료", Ic: IcArchive, match: ["/archive", "/minute"] },
  { key: "/committee", label: "위원회", Ic: IcCommittee, match: ["/committee", "/members", "/rules", "/suggestions"] },
];

export default function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isOn = (m) =>
    m.some((p) => (p === "/" ? pathname === "/" : pathname.startsWith(p)));

  return (
    <nav className="bottomnav">
      {TABS.map(({ key, label, Ic, match }) => {
        const on = isOn(match);
        return (
          <button key={key} className={`navitem ${on ? "on" : ""}`} onClick={() => nav(key)}>
            <span className="ic"><Ic size={22} /></span>
            <span className="lab">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
