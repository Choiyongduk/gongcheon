import React from "react";

/* 자유와혁신 심볼 재현:
   건곤감리에서 착안한 '네 개의 곡선'이 바람결처럼 우상향으로 흐르는 형태.
   색상은 단색(currentColor 계열)으로 받아 헤더/네이비/화이트 어디서나 사용. */
export function Symbol({ size = 28, color = "#fffff3" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => {
        const o = i * 7;
        return (
          <path
            key={i}
            d={`M ${14 + o} 86
                C ${30 + o} ${64 - o}, ${50 + o * 0.4} ${66 - o}, ${62} ${44 - o}
                S ${80 - o * 0.3} ${20 - o}, ${88 - o} ${14}`}
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            opacity={1 - i * 0.16}
          />
        );
      })}
    </svg>
  );
}

/* 가로형 로고타입 (심볼 + 워드마크) */
export function Wordmark({ color = "#051C4C", symbolColor = "#A50034", height = 22 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Symbol size={height + 8} color={symbolColor} />
      <span
        className="display"
        style={{ fontSize: height, color, fontWeight: 700, letterSpacing: "-0.03em" }}
      >
        자유와혁신
      </span>
    </span>
  );
}
