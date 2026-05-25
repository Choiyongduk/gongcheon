import React, { useEffect, useState } from "react";
import { IcDown } from "./Icons";

/* 홈 화면에 앱 설치 (PWA).
   - Android/데스크톱 Chrome: beforeinstallprompt 캡처 후 설치
   - iOS Safari: 프롬프트 불가 → 공유 메뉴 안내 */
export default function InstallButton({ variant = "card" }) {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || installed) return null; // 이미 설치됨

  const click = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else if (isIos) {
      setShowIos((v) => !v);
    } else {
      setShowIos((v) => !v); // 안내 토글 (지원 안 되는 브라우저)
    }
  };

  const Btn = (
    <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={click}>
      <IcDown size={18} /> 홈 화면에 앱 설치
    </button>
  );

  return (
    <div>
      {variant === "card" ? (
        <div className="card card-pad">{Btn}</div>
      ) : Btn}
      {showIos && (
        <div className="card card-pad" style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>
          {isIos ? (
            <>아이폰에서는 사파리 하단의 <b>공유</b> 버튼을 누른 뒤<br /><b>“홈 화면에 추가”</b>를 선택하세요.</>
          ) : (
            <>브라우저 메뉴(⋯)에서 <b>“홈 화면에 추가”</b> 또는 <b>“앱 설치”</b>를 선택하세요.</>
          )}
        </div>
      )}
    </div>
  );
}
