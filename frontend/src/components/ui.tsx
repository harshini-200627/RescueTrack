
import {
  type ReactNode,
  useEffect,
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import { Loader2, X } from 'lucide-react';

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div className={clsx('card rt-ui-card p-5', className)}>
    {children}
  </div>
);

export function Btn({
  v = 'primary',
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  v?: 'primary' | 'ghost' | 'danger';
}) {
  return (
    <button
      {...p}
      className={clsx(
        'rt-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        v === 'primary' && 'rt-btn-primary',
        v === 'ghost' && 'rt-btn-ghost',
        v === 'danger' && 'rt-btn-danger',
        className,
      )}
    />
  );
}

const tone: Record<string, string> = {
  Critical: 'rt-badge-critical',
  Moderate: 'rt-badge-moderate',
  Minor: 'rt-badge-minor',
  Resolved: 'rt-badge-resolved',
  Reported: 'rt-badge-neutral',
  'In Progress': 'rt-badge-moderate',
  Dispatched: 'rt-badge-neutral',
  Available: 'rt-badge-resolved',
  Busy: 'rt-badge-moderate',
  Offline: 'rt-badge-offline',
};

export const Badge = ({ t }: { t: string }) => (
  <span
    className={clsx(
      'rt-badge rounded-full px-2.5 py-1 text-xs font-bold',
      tone[t] ?? 'rt-badge-neutral',
    )}
  >
    {t}
  </span>
);

export const Spinner = () => (
  <div className="flex justify-center p-10 text-slate2">
    <Loader2 className="animate-spin" size={24} />
  </div>
);

export const PageHead = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: ReactNode;
}) => (
  <div className="rt-page-head mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="mt-1 text-sm text-slate2">{sub}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
  </div>
);

export const Stat = ({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
}) => (
  <Card className="rt-stat-card">
    <div className="flex items-center gap-3 text-sm text-slate2">
      <span className="rt-stat-icon">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
      {value}
    </div>
    {hint && <div className="mt-1 text-xs text-slate2">{hint}</div>}
  </Card>
);

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rt-dialog card w-full max-w-md p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rt-dialog-close"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Select = ({
  value,
  onChange,
  opts,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  opts: string[];
  label: string;
}) => (
  <select
    aria-label={label}
    className="inp rt-select !w-auto"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    {opts.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const ToastContext = createContext<(message: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function Toasts({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<
    { id: number; text: string }[]
  >([]);

  const push = (message: string) => {
    const id = Date.now() + Math.random();

    setMessages((current) => [...current, { id, text: message }]);

    window.setTimeout(() => {
      setMessages((current) => current.filter((item) => item.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={push}>
      {children}

      <div
        className="fixed bottom-4 right-4 z-[3000] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="rt-toast rounded-xl px-4 py-3 text-sm font-semibold shadow-lg"
          >
            {message.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const fmt = (date: string) =>
  new Date(date).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
