import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const s = document.querySelector(".scroll");
    if (s) s.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollTop />
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
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
