import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import { Notices, NoticeDetail } from "./pages/Notices";
import Members from "./pages/Members";
import Rules from "./pages/Rules";
import { Archive, MinuteDetail } from "./pages/Archive";
import Schedule from "./pages/Schedule";
import Suggestions from "./pages/Suggestions";
import Committee from "./pages/Committee";
import Login from "./pages/Login";
import Admin from "./pages/admin/Admin";
import Notifications from "./pages/Notifications";
import { useAuth } from "./context/AuthContext";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const s = document.querySelector(".scroll");
    if (s) s.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 앱 첫 진입 시 로그인 페이지를 한 번 보여준다 (로그인 안 한 경우).
// 모듈 변수라 새로고침(콜드 스타트) 때만 동작하고, 세션 중 재이동은 막지 않는다.
let landedOnce = false;
function LoginLanding() {
  const { ready, user, hasSupabase } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (!ready || landedOnce) return;
    landedOnce = true;
    if (hasSupabase && !user && pathname === "/") nav("/login", { replace: true });
  }, [ready, user, hasSupabase, pathname, nav]);
  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollTop />
      <LoginLanding />
      <div className="scroll">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/minute/:id" element={<MinuteDetail />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/members" element={<Members />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
