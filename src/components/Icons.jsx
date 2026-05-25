import React from "react";

const S = ({ children, size = 22, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IcHome = (p) => (<S {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></S>);
export const IcBell = (p) => (<S {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></S>);
export const IcCalendar = (p) => (<S {...p}><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></S>);
export const IcArchive = (p) => (<S {...p}><path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5Z" /><path d="M4 7.5 12 11l8-3.5M12 11v9" /></S>);
export const IcMembers = (p) => (<S {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3.3 2.9-5 5.5-5s4.9 1.7 5.5 5" /><path d="M16 8.2a3 3 0 0 1 0 5.6M17.5 19c-.3-1.8-1-3.2-2-4.2" /></S>);
export const IcScale = (p) => (<S {...p}><path d="M12 3v18M7 21h10M5 7l-3 6h6Zm14 0-3 6h6Z" /><path d="M5 7l7-2 7 2" /></S>);
export const IcDoc = (p) => (<S {...p}><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></S>);
export const IcBulb = (p) => (<S {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2H14.5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /></S>);
export const IcCommittee = (p) => (<S {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></S>);
export const IcChevron = (p) => (<S {...p}><path d="m9 6 6 6-6 6" /></S>);
export const IcBack = (p) => (<S {...p} sw={1.8}><path d="m15 6-6 6 6 6" /></S>);
export const IcDown = (p) => (<S {...p}><path d="M12 4v11m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></S>);
export const IcChevDown = (p) => (<S {...p}><path d="m6 9 6 6 6-6" /></S>);
export const IcCheck = (p) => (<S {...p} sw={2}><path d="m5 12 5 5L20 6" /></S>);
export const IcPin = (p) => (<S {...p}><path d="M12 17v5" /><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6Z" /></S>);
export const IcPlus = (p) => (<S {...p} sw={2}><path d="M12 5v14M5 12h14" /></S>);
export const IcTrash = (p) => (<S {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></S>);
export const IcEdit = (p) => (<S {...p}><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="M14 5l4 4" /></S>);
export const IcLogout = (p) => (<S {...p}><path d="M14 4h5v16h-5" /><path d="M3 12h12m0 0-4-4m4 4-4 4" /></S>);
export const IcLock = (p) => (<S {...p}><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></S>);
export const IcVote = (p) => (<S {...p}><path d="M5 10 12 3l7 7" /><rect x="4" y="10" width="16" height="11" rx="2" /><path d="m9 15 2 2 4-4" /></S>);
export const IcSend = (p) => (<S {...p}><path d="M4 12 20 4l-6 16-3-7-7-1Z" /></S>);
export const IcHeart = ({ size = 22, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-9.2-8.6C1.1 8 2.6 5 5.6 5c1.9 0 3.2 1.1 4.4 2.6C11.2 6.1 12.5 5 14.4 5c3 0 4.5 3 2.8 6.4C19 15.5 12 20 12 20Z" />
  </svg>
);
