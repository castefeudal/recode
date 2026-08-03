"use client";

import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type DetailsHTMLAttributes, type HTMLAttributes, type ImgHTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

export function Button({ variant = "primary", icon, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger"; icon?: IconName }) {
  return <button className={`uiButton uiButton--${variant} ${className}`.trim()} {...props}>{icon && <Icon name={icon} size={17} />}<span>{children}</span></button>;
}
export function IconButton({ icon, label, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) {
  return <button className={`uiIconButton ${className}`.trim()} aria-label={label} title={label} {...props}><Icon name={icon} size={19} /></button>;
}
export function Badge({ tone = "neutral", children, className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info" }) {
  return <span className={`uiBadge uiBadge--${tone} ${className}`.trim()} {...props}>{children}</span>;
}
export function Card({ tone = "default", children, className = "", ...props }: HTMLAttributes<HTMLElement> & { tone?: "default" | "raised" | "quiet" | "narrative" }) {
  return <article className={`uiCard uiCard--${tone} ${className}`.trim()} {...props}>{children}</article>;
}
export function ProgressBar({ value, max = 100, label, className = "" }: { value: number; max?: number; label: string; className?: string }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className={`uiProgress ${className}`.trim()} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(max, Math.max(0, value))}><i style={{ width: `${percent}%` }} /></div>;
}
export function StatusIndicator({ online, children }: { online: boolean; children: ReactNode }) {
  return <span className={`uiStatus ${online ? "isOnline" : "isOffline"}`}><i aria-hidden="true" />{children}</span>;
}
export function Field({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const id = props.id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <label className="uiField" htmlFor={id}><span>{label}</span><input id={id} aria-invalid={Boolean(error)} aria-describedby={hint || error ? `${id}-help` : undefined} {...props} />{(error || hint) && <small id={`${id}-help`} className={error ? "isError" : ""}>{error ?? hint}</small>}</label>;
}
export function TextAreaField({ label, hint, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const id = props.id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <label className="uiField" htmlFor={id}><span>{label}</span><textarea id={id} aria-invalid={Boolean(error)} aria-describedby={hint || error ? `${id}-help` : undefined} {...props} />{(error || hint) && <small id={`${id}-help`} className={error ? "isError" : ""}>{error ?? hint}</small>}</label>;
}
export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`uiSkeleton ${className}`.trim()} aria-hidden="true" {...props} />; }
export function Alert({ tone = "info", title, children, className = "" }: { tone?: "info" | "success" | "warning" | "danger"; title: string; children?: ReactNode; className?: string }) {
  return <aside className={`uiAlert uiAlert--${tone} ${className}`.trim()} role={tone === "danger" ? "alert" : "status"}><strong>{title}</strong>{children && <p>{children}</p>}</aside>;
}
export function SegmentedControl({ label, options, value, onChange }: { label: string; options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return <div className="uiSegmented" role="group" aria-label={label}>{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
export function EmptyState({ icon = "spark", title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return <section className="uiEmpty"><Icon name={icon} size={28} /><h3>{title}</h3><p>{text}</p>{action}</section>;
}
export function DialogFrame({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    return () => previous?.focus();
  }, []);
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])") ?? [])];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <div className="uiDialogBackdrop" role="presentation" onMouseDown={onClose}><section ref={dialogRef} className="uiDialog" role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title" onKeyDown={handleKeyDown} onMouseDown={(event) => event.stopPropagation()}><header><h2 id="ui-dialog-title">{title}</h2><IconButton icon="close" label="Close dialog" onClick={onClose} /></header>{children}</section></div>;
}


export function TextLink({ className = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`uiLink ${className}`.trim()} {...props}>{children}<Icon name="arrow" size={15} /></a>;
}
export function SelectField({ label, hint, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; children: ReactNode }) {
  const id = props.id ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return <label className="uiField" htmlFor={id}><span>{label}</span><select id={id} {...props}>{children}</select>{hint && <small>{hint}</small>}</label>;
}
export function CheckboxField({ label, description, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return <label className="uiCheck"><input type="checkbox" {...props} /><span><b>{label}</b>{description && <small>{description}</small>}</span></label>;
}
export function RadioGroup({ label, name, options, value, onChange }: { label: string; name: string; options: Array<{ value: string; label: string; description?: string }>; value: string; onChange: (value: string) => void }) {
  return <fieldset className="uiRadio"><legend>{label}</legend>{options.map((option) => <label key={option.value}><input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} /><span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></label>)}</fieldset>;
}
export function Switch({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <button type="button" className="uiSwitch" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}><i aria-hidden="true" /><span>{label}</span></button>;
}
export function SliderField({ label, value, valueLabel, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; value: number | string; valueLabel?: string }) {
  return <label className="uiSlider"><span>{label}<b>{valueLabel ?? value}</b></span><input type="range" value={value} {...props} /></label>;
}
export function Tabs({ label, tabs, active, onChange }: { label: string; tabs: Array<{ id: string; label: string }>; active: string; onChange: (id: string) => void }) {
  return <div className="uiTabs" role="tablist" aria-label={label}>{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>;
}
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="uiTooltip" data-tooltip={label}>{children}<span role="tooltip">{label}</span></span>;
}
export function Popover({ summary, children, className = "", ...props }: DetailsHTMLAttributes<HTMLDetailsElement> & { summary: ReactNode; children: ReactNode }) {
  return <details className={`uiPopover ${className}`.trim()} {...props}><summary>{summary}</summary><div>{children}</div></details>;
}
export const Dropdown = Popover;
export function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="uiSheetBackdrop" role="presentation" onMouseDown={onClose}><section className="uiSheet" role="dialog" aria-modal="true" aria-labelledby="ui-sheet-title" onMouseDown={(event) => event.stopPropagation()}><header><h2 id="ui-sheet-title">{title}</h2><IconButton icon="close" label="Close sheet" onClick={onClose} /></header>{children}</section></div>;
}
export function ToastMessage({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger"; children: ReactNode }) {
  return <div className={`uiToast uiToast--${tone}`} role={tone === "danger" ? "alert" : "status"}>{children}</div>;
}
export function Avatar({ name, src, size = "md" }: { name: string; src?: string; size?: "sm" | "md" | "lg" }) {
  return src ? <img className={`uiAvatar uiAvatar--${size}`} src={src} alt={name} /> : <span className={`uiAvatar uiAvatar--${size}`} role="img" aria-label={name}>{name.trim().slice(0, 1).toUpperCase()}</span>;
}
export function ResponsiveImage({ alt, className = "", ...props }: ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return <img className={`uiImage ${className}`.trim()} alt={alt} loading={props.loading ?? "lazy"} decoding={props.decoding ?? "async"} {...props} />;
}
export function NarrativeCard({ kicker, title, children, action }: { kicker: string; title: string; children: ReactNode; action?: ReactNode }) {
  return <article className="uiNarrativeCard"><small>{kicker}</small><h3>{title}</h3><div>{children}</div>{action && <footer>{action}</footer>}</article>;
}
export function StatBlock({ label, value, detail, progress }: { label: string; value: ReactNode; detail?: string; progress?: number }) {
  return <article className="uiStat"><small>{label}</small><strong>{value}</strong>{detail && <span>{detail}</span>}{typeof progress === "number" && <ProgressBar value={progress} label={`${label}: ${progress}%`} />}</article>;
}
export function Timeline({ items }: { items: Array<{ id: string; label: string; text: string; state?: "past" | "current" | "future" }> }) {
  return <ol className="uiTimeline">{items.map((item) => <li key={item.id} className={`is-${item.state ?? "future"}`}><i aria-hidden="true" /><div><small>{item.label}</small><p>{item.text}</p></div></li>)}</ol>;
}
export function Choice({ index, title, description, selected, disabled, onClick }: { index: number; title: string; description?: string; selected?: boolean; disabled?: boolean; onClick: () => void }) {
  return <button type="button" className="uiChoice" aria-pressed={selected} disabled={disabled} onClick={onClick}><span>{String(index).padStart(2, "0")}</span><div><b>{title}</b>{description && <small>{description}</small>}</div><Icon name="arrow" size={17} /></button>;
}
export function AppHeader({ brand, children, className = "" }: { brand: ReactNode; children?: ReactNode; className?: string }) {
  return <header className={`uiHeader ${className}`.trim()}>{brand}<div>{children}</div></header>;
}
export function AppFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <footer className={`uiFooter ${className}`.trim()}>{children}</footer>;
}
