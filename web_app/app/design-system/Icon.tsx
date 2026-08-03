import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "today" | "story" | "quests" | "body" | "nutrition" | "recovery"
  | "mind" | "relations" | "work" | "city" | "profile" | "sun" | "moon"
  | "motion" | "contrast" | "network" | "arrow" | "check" | "lock"
  | "sync" | "download" | "upload" | "trash" | "spark" | "menu" | "close";

const paths: Record<IconName, ReactNode> = {
  today: <><path d="M4 12h16"/><path d="M12 4v16"/><circle cx="12" cy="12" r="8"/></>,
  story: <><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z"/><path d="M9 8h6M9 12h5"/></>,
  quests: <><path d="M7 3h10v18l-5-3-5 3V3Z"/><path d="m9.5 10 1.6 1.6 3.5-3.7"/></>,
  body: <><circle cx="12" cy="5" r="2"/><path d="M8 21v-5l-2-4 3-3h6l3 3-2 4v5M9 9l3 5 3-5"/></>,
  nutrition: <><path d="M5 3v8a3 3 0 0 0 3 3V3M8 14v7M16 3v18M16 3c3 2 3 7 0 9"/></>,
  recovery: <><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/><path d="M15 4h.01M19 8h.01"/></>,
  mind: <><path d="M9.5 4A3.5 3.5 0 0 0 6 7.5c0 .5.1 1 .3 1.4A3.7 3.7 0 0 0 5 16a4 4 0 0 0 4 4h1V4h-.5ZM14.5 4A3.5 3.5 0 0 1 18 7.5c0 .5-.1 1-.3 1.4A3.7 3.7 0 0 1 19 16a4 4 0 0 1-4 4h-1V4h.5Z"/></>,
  relations: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M3 20c0-4 2-7 5-7s5 3 5 7M13 19c.3-3 1.7-5 4-5 2.5 0 4 2 4 5"/></>,
  work: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></>,
  city: <><path d="M3 21V8l6-3v16M9 21V3l7 3v15M16 21v-9l5-2v11"/><path d="M6 11h.01M6 15h.01M12 8h.01M12 12h.01M12 16h.01M19 15h.01"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>,
  motion: <><path d="M3 12h3l3-7 4 14 3-7h5"/><path d="m18 9 3 3-3 3"/></>,
  contrast: <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18V3Z"/></>,
  network: <><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  sync: <><path d="M20 7h-5V2M4 17h5v5"/><path d="M18.4 10A7 7 0 0 0 6.3 5.3L4 7M5.6 14A7 7 0 0 0 17.7 18.7L20 17"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 21h14"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  spark: <><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="M6 6l12 12M18 6 6 18"/></>,
};

export function Icon({ name, size = 20, title, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number; title?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>{title && <title>{title}</title>}{paths[name]}</svg>;
}
