import React from "react";
import { useNavigate } from "react-router-dom";
import { IcBack } from "./Icons";

export default function TopBar({ title, right }) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="iconbtn" onClick={() => nav(-1)} aria-label="뒤로">
          <IcBack size={26} />
        </button>
        <div className="title" style={{ flex: 1 }}>{title}</div>
        {right}
      </div>
    </div>
  );
}
