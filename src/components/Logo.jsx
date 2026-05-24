import React from "react";

/* 자유와혁신 실제 로고(물결 심볼 + 워드마크) 사용.
   - Symbol: 물결 심볼만. 네이비 등 어두운 면에는 white 변형 사용.
   - FullLogo: 물결 + "자유와혁신" 워드마크 전체. */

export function Symbol({ size = 28, white = false, style }) {
  const src = white ? "/logo-wave-white.png" : "/logo-wave.png";
  return (
    <img
      src={src}
      alt="자유와혁신 심볼"
      style={{ height: size, width: "auto", display: "block", objectFit: "contain", ...style }}
    />
  );
}

export function FullLogo({ height = 40, style }) {
  return (
    <img
      src="/logo-full.png"
      alt="자유와혁신"
      style={{ height, width: "auto", display: "block", objectFit: "contain", ...style }}
    />
  );
}

/* 호환용 */
export function Wordmark({ height = 40, style }) {
  return <FullLogo height={height} style={style} />;
}
