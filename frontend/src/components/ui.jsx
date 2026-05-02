import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Search,
  X
} from "lucide-react";

import {
  cn,
  formatDate,
  initials,
  priorityTheme,
  statusLabel,
  statusTheme
} from "../lib/utils.js";

export function LogoMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30">
        <Check className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="text-[2rem] font-extrabold tracking-tight text-ink">
          Task<span className="text-brand-500">Pro</span>
        </div>
      )}
    </div>
  );
}

export function Card({ className, children }) {
  return <div className={cn("panel-card", className)}>{children}</div>;
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[2rem] font-extrabold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-2 text-soft">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  className,
  children,
  icon,
  type = "button",
  ...props
}) {
  const Icon = icon;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({ className, children, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-200 hover:text-brand-600",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-soft transition hover:bg-brand-50 hover:text-brand-600",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SearchField({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="flex w-full items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-sm">
      <Search className="h-5 w-5 text-slate-400" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink placeholder:text-slate-400"
      />
    </label>
  );
}

export function StatCard({
  icon,
  title,
  value,
  note,
  iconClassName,
  className
}) {
  const Icon = icon;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-soft">{title}</p>
          <div className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
            {value}
          </div>
          {note ? <p className="mt-2 text-sm text-soft">{note}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600",
            iconClassName
          )}
        >
          {Icon ? <Icon className="h-6 w-6" /> : null}
        </div>
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "default", className }) {
  const toneClass =
    tone === "high" || tone === "medium" || tone === "low"
      ? priorityTheme[tone]
      : statusTheme[tone] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ user, size = "md", showStatus = false }) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl"
  };

  return (
    <div className="relative inline-flex">
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold text-white shadow-sm",
          sizes[size]
        )}
        style={{ background: user?.avatar?.bg || "linear-gradient(135deg, #c4b5fd, #7c3aed)" }}
      >
        {initials(user?.name)}
      </div>
      {showStatus ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
            user?.presence === "online"
              ? "bg-emerald-500"
              : user?.presence === "away"
                ? "bg-amber-500"
                : "bg-slate-400"
          )}
        />
      ) : null}
    </div>
  );
}

export function AvatarGroup({ users = [], extraLabel }) {
  return (
    <div className="flex items-center">
      {users.slice(0, 4).map((user, index) => (
        <div key={user._id || user.email || `${user.name}-${index}`} className="-ml-2 first:ml-0">
          <Avatar user={user} size="sm" />
        </div>
      ))}
      {extraLabel ? (
        <span className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
          {extraLabel}
        </span>
      ) : null}
    </div>
  );
}

export function ProgressBar({ value, color = "#7c3aed", className }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-slate-100", className)}>
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-xs text-soft">{hint}</span> : null}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100/70",
        props.className
      )}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink focus:border-brand-300 focus:ring-4 focus:ring-brand-100/70",
        props.className
      )}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-100/70",
        props.className
      )}
    />
  );
}

export function InfoRow({ label, value, children }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm text-soft">{label}</span>
      {children || <span className="font-semibold text-ink">{value}</span>}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
        <ArrowRight className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-soft">{description}</p>
    </Card>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-brand-100 bg-white/90 p-8 text-sm text-soft shadow-card">
      {label}
    </div>
  );
}

export function FilterPills({ items, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
            active === item.value
              ? "border-brand-200 bg-brand-50 text-brand-600"
              : "border-brand-100 bg-white text-soft hover:text-ink"
          )}
        >
          {item.label}
          {item.count !== undefined ? (
            <span className="ml-2 text-soft">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function MetricLegend({ items }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-ink">{item.label}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {item.value !== undefined ? (
              <span className="font-semibold text-ink">{item.value}</span>
            ) : null}
            {item.note ? <span className="text-soft">{item.note}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
  size = "md"
}) {
  const sizes = {
    sm: "max-w-xl",
    md: "max-w-2xl",
    lg: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className={cn(
              "w-full rounded-[32px] border border-white/80 bg-white p-6 shadow-2xl shadow-brand-500/15",
              sizes[size]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-ink">{title}</h3>
                {subtitle ? <p className="mt-2 text-sm text-soft">{subtitle}</p> : null}
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl border border-brand-100 p-2 text-soft transition hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DetailLabel({ label, value, tone }) {
  return (
    <div className="grid gap-1">
      <span className="text-sm text-soft">{label}</span>
      {tone ? (
        <Badge tone={tone}>{value || statusLabel(tone)}</Badge>
      ) : (
        <span className="font-semibold text-ink">{value}</span>
      )}
    </div>
  );
}

export function MiniTable({ headers, rows, renderRow }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
      <div className="hidden grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-4 border-b border-brand-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 lg:grid">
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      <div className="divide-y divide-brand-100">
        {rows.map((row, index) => renderRow(row, index))}
      </div>
    </div>
  );
}

export function InlineStatus({ value, className }) {
  return (
    <Badge tone={value} className={className}>
      {statusLabel(value)}
    </Badge>
  );
}

export function ActionLink({ children, ...props }) {
  return (
    <button
      className="text-sm font-semibold text-brand-500 transition hover:text-brand-600"
      {...props}
    >
      {children}
    </button>
  );
}

export function MetaLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

export { formatDate, statusLabel };
