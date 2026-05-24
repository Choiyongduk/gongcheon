import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Card } from "../components/ui";
import { FullLogo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setMsg("");
    const { error } =
      mode === "in" ? await signIn(email, pw) : await signUp(email, pw, name);
    setBusy(false);
    if (error) return setMsg(error.message);
    if (mode === "up") return setMsg("가입 완료. 운영자 승인 후 관리 기능을 사용할 수 있습니다.");
    nav("/committee");
  };

  return (
    <div className="page">
      <TopBar title={mode === "in" ? "로그인" : "회원가입"} />
      <div style={{ padding: 18 }}>
        <div className="center" style={{ margin: "18px 0 26px" }}>
          <FullLogo height={46} style={{ margin: "0 auto" }} />
          <div className="display" style={{ fontSize: 17, color: "var(--navy)", marginTop: 14 }}>공천관리위원회</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>위원·운영자 전용</div>
        </div>

        <Card className="card-pad">
          {mode === "up" && (
            <div style={{ marginBottom: 12 }}>
              <label className="label">이름</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="label">이메일</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">비밀번호</label>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          </div>
          {msg && <div style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 12, lineHeight: 1.5 }}>{msg}</div>}
          <button className="btn btn-red" onClick={submit} disabled={busy}>
            {busy ? "처리 중…" : mode === "in" ? "로그인" : "회원가입"}
          </button>
          <button className="btn btn-ghost" style={{ marginTop: 9 }} onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
            {mode === "in" ? "회원가입" : "로그인으로"}
          </button>
        </Card>
        <p className="muted center" style={{ fontSize: 11, marginTop: 16, lineHeight: 1.7 }}>
          비밀번호는 본인이 직접 입력합니다. 가입 후 운영자가 권한을 부여합니다.
        </p>
      </div>
    </div>
  );
}
