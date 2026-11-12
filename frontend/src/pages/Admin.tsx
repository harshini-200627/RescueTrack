
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

import {
  Card,
  Badge,
  Stat,
  PageHead,
  Spinner,
  Select,
  Btn,
  Dialog,
  useToast,
  fmt,
} from '../components/ui';

import { api, sevColor, toCSV } from '../lib/mockApi';
import { useData, byDay, bySev, avgResp } from '../lib/hooks';

/* -----------------------------------------
   Responders
------------------------------------------ */

export function Responders() {
  const { inc, res, reload } = useData();

  const [d, setD] = useState('All');
  const [sel, setSel] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const t = useToast();

  if (!res || !inc) return <Spinner />;

  const c = (s: string) => res.filter(r => r.status === s).length;

  const list = res.filter(r => d === 'All' || r.type === d);

  const open = inc.filter(i => i.status !== 'Resolved');

  const assignResponder = async (incidentId: string) => {
    if (!sel || assigning) return;

    setAssigning(true);

    try {
      await api.assign(incidentId, sel);

      setSel(null);

      await Promise.resolve(reload());

      t('Responder assigned successfully!');
    } catch (error) {
      t(
        error instanceof Error
          ? error.message
          : 'Failed to assign responder. Please try again.'
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <PageHead title="Responders">
        <Select
          label="Department"
          value={d}
          onChange={setD}
          opts={['All', 'Ambulance', 'Police', 'Fire']}
        />
      </PageHead>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={null} label="Total" value={res.length} />
        <Stat icon={null} label="Available" value={c('Available')} />
        <Stat icon={null} label="Busy" value={c('Busy')} />
        <Stat icon={null} label="Offline" value={c('Offline')} />
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate2">
            <tr>
              <th className="py-2">Unit</th>
              <th>Type</th>
              <th>Zone</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {list.map(r => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2.5 font-semibold">
                  {r.id} · {r.name}
                </td>
                <td>{r.type}</td>
                <td>{r.zone}</td>
                <td>
                  <Badge t={r.status} />
                </td>
                <td className="text-right">
                  <Btn
                    v="ghost"
                    disabled={r.status !== 'Available' || assigning}
                    onClick={() => setSel(r.id)}
                  >
                    Assign
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog
        open={!!sel}
        onClose={() => {
          if (!assigning) setSel(null);
        }}
        title={`Assign ${sel}`}
      >
        {open.length === 0 ? (
          <p className="text-sm">No open incidents.</p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-auto">
            {open.slice(0, 10).map(i => (
              <li key={i.id}>
                <button
                  type="button"
                  disabled={assigning}
                  className="flex w-full justify-between rounded-xl border border-line p-3 text-left text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => assignResponder(i.id)}
                >
                  <span>
                    {i.id} · {i.location}
                  </span>

                  <Badge t={i.severity} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {assigning && (
          <p className="mt-3 text-sm text-slate2" role="status">
            Assigning responder, please wait...
          </p>
        )}
      </Dialog>
    </>
  );
}

/* -----------------------------------------
   Accident History
------------------------------------------ */

export function History() {
  const { inc } = useData();

  const [q, setQ] = useState('');
  const [sev, setSev] = useState('All');
  const [st, setSt] = useState('All');
  const [p, setP] = useState(0);

  if (!inc) return <Spinner />;

  const f = inc.filter(
    i =>
      (sev === 'All' || i.severity === sev) &&
      (st === 'All' || i.status === st) &&
      (i.id + i.location).toLowerCase().includes(q.toLowerCase())
  );

  const pages = Math.max(1, Math.ceil(f.length / 10));
  const pg = Math.min(p, pages - 1);

  return (
    <>
      <PageHead title="Accident history" sub={`${f.length} records`} />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          aria-label="Search incidents"
          className="inp !w-64"
          placeholder="Search ID or location"
          value={q}
          onChange={e => {
            setQ(e.target.value);
            setP(0);
          }}
        />

        <Select
          label="Severity"
          value={sev}
          onChange={v => {
            setSev(v);
            setP(0);
          }}
          opts={['All', 'Critical', 'Moderate', 'Minor']}
        />

        <Select
          label="Status"
          value={st}
          onChange={v => {
            setSt(v);
            setP(0);
          }}
          opts={[
            'All',
            'Reported',
            'Dispatched',
            'In Progress',
            'Resolved',
          ]}
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate2">
            <tr>
              <th className="py-2">ID</th>
              <th>Date</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {f.slice(pg * 10, pg * 10 + 10).map(i => (
              <tr key={i.id} className="border-t border-line">
                <td className="py-2.5">
                  <Link
                    className="font-semibold underline"
                    to={`/incident-details/${i.id}`}
                  >
                    {i.id}
                  </Link>
                </td>

                <td>{fmt(i.detectedAt)}</td>
                <td>{i.location}</td>
                <td>
                  <Badge t={i.severity} />
                </td>
                <td>
                  <Badge t={i.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {f.length === 0 && (
          <p className="p-6 text-center text-sm text-slate2">
            No records match. Clear a filter to see more.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-sm">
          <span>
            Page {pg + 1} of {pages}
          </span>

          <div className="flex gap-2">
            <Btn
              v="ghost"
              disabled={pg === 0}
              onClick={() => setP(pg - 1)}
            >
              Previous
            </Btn>

            <Btn
              v="ghost"
              disabled={pg >= pages - 1}
              onClick={() => setP(pg + 1)}
            >
              Next
            </Btn>
          </div>
        </div>
      </Card>
    </>
  );
}

/* -----------------------------------------
   Reports
------------------------------------------ */

export function Reports() {
  const { inc } = useData();

  const [range, setRange] = useState('30');
  const t = useToast();

  if (!inc) return <Spinner />;

  const days = +range;

  const f = inc.filter(
    i =>
      Date.now() - new Date(i.detectedAt).getTime() <
      days * 864e5
  );

  const rt = ['Critical', 'Moderate', 'Minor'].map(s => {
    const v = f.filter(
      i => i.severity === s && i.responseMin != null
    );

    return {
      name: s,
      min: v.length
        ? Math.round(
            v.reduce((a, b) => a + (b.responseMin || 0), 0) /
              v.length
          )
        : 0,
    };
  });

  return (
    <>
      <PageHead
        title="Reports"
        sub="Based on simulated records"
      >
        <div className="flex gap-2">
          <Select
            label="Date range"
            value={range}
            onChange={setRange}
            opts={['2', '7', '30']}
          />

          <Btn
            onClick={() => {
              const b = new Blob([toCSV(f)], {
                type: 'text/csv',
              });

              const a = document.createElement('a');
              a.href = URL.createObjectURL(b);
              a.download = `rescuetrack-simulated-${range}d.csv`;
              a.click();

              URL.revokeObjectURL(a.href);
              t('CSV exported');
            }}
          >
            Export CSV
          </Btn>
        </div>
      </PageHead>

      <p className="mb-3 text-xs text-slate2">
        Range options are days (2, 7, 30).
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={null} label="Incidents" value={f.length} />
        <Stat
          icon={null}
          label="Critical"
          value={f.filter(i => i.severity === 'Critical').length}
        />
        <Stat icon={null} label="Avg response" value={`${avgResp(f)} min`} />
        <Stat
          icon={null}
          label="Resolved"
          value={f.filter(i => i.status === 'Resolved').length}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-bold">Incident trend</h2>

          <div className="h-60">
            <ResponsiveContainer>
              <LineChart
                data={byDay(f, Math.min(days, 14) < 2 ? 2 : Math.min(days, 14))}
              >
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} width={28} fontSize={11} />
                <Tooltip />
                <Line
                  dataKey="count"
                  stroke="#26282b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">Severity</h2>

          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={bySev(f)}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {bySev(f).map(d => (
                    <Cell
                      key={d.name}
                      fill={sevColor[d.name as keyof typeof sevColor]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="mb-3 font-bold">
            Average response minutes by severity
          </h2>

          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={rt}>
                <XAxis dataKey="name" />
                <YAxis width={28} />
                <Tooltip />
                <Bar dataKey="min" fill="#5b6168" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

/* -----------------------------------------
   Settings
------------------------------------------ */

export function SettingsPage() {
  const t = useToast();
  const nv = useNavigate();

  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  const [err, setErr] = useState('');

  const Tg = ({ l }: { l: string }) => (
    <label className="flex items-center justify-between py-2 text-sm">
      {l}
      <input type="checkbox" defaultChecked className="h-4 w-4" />
    </label>
  );

  return (
    <>
      <PageHead title="Settings" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold">Change password</h2>

          <form
            className="space-y-3"
            onSubmit={e => {
              e.preventDefault();

              const d = new FormData(e.currentTarget);
              const n = String(d.get('n'));

              if (n.length < 8) {
                setErr('New password must be at least 8 characters.');
                return;
              }

              if (d.get('n') !== d.get('c')) {
                setErr('Passwords do not match.');
                return;
              }

              setErr('');
              t('Password updated (simulated)');
              e.currentTarget.reset();
            }}
          >
            <input
              name="o"
              type="password"
              className="inp"
              placeholder="Current password"
            />

            <input
              name="n"
              type="password"
              className="inp"
              placeholder="New password"
            />

            <input
              name="c"
              type="password"
              className="inp"
              placeholder="Confirm new password"
            />

            {err && (
              <p role="alert" className="text-sm text-crit">
                {err}
              </p>
            )}

            <Btn>Update password</Btn>
          </form>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Notifications</h2>

          <Tg l="New critical incident" />
          <Tg l="Assignment changes" />
          <Tg l="Daily summary email" />

          <h2 className="mb-2 mt-4 font-bold">Theme</h2>

          <Btn
            v="ghost"
            onClick={() => {
              document.documentElement.classList.toggle('dark');
              setDark(!dark);
            }}
          >
            {dark ? 'Switch to light' : 'Switch to dark'}
          </Btn>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Security</h2>

          <Tg l="Two-factor sign-in (needs backend)" />

          <p className="text-xs text-slate2">
            Session handling is simulated until the backend is connected.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">Session</h2>

          <Btn
            v="danger"
            onClick={() => {
              api.logout();
              nv('/login');
            }}
          >
            Log out
          </Btn>
        </Card>
      </div>
    </>
  );
}

/* -----------------------------------------
   Profile
------------------------------------------ */

export function Profile() {
  const t = useToast();

  const [ed, setEd] = useState(false);

  const [f, setF] = useState({
    name: 'Demo Operator',
    email: sessionStorage.getItem('rt_user') || '',
    phone: '+91 90000 00000',
    department: 'Control room',
  });

  return (
    <>
      <PageHead title="Profile" />

      <Card className="max-w-2xl">
        <div className="mb-5 flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-ink text-2xl font-bold text-white">
            {f.name[0]}
          </div>

          <div>
            <div className="font-bold">{f.name}</div>
            <Badge t="Available" />
            <span className="text-sm text-slate2">
              Role: Dispatcher
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(['name', 'email', 'phone', 'department'] as const).map(k => (
            <label
              key={k}
              className="text-sm font-semibold capitalize"
            >
              {k}

              <input
                className="inp mt-1"
                disabled={!ed || k === 'email'}
                value={f[k]}
                onChange={e => setF({ ...f, [k]: e.target.value })}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {ed ? (
            <>
              <Btn
                onClick={() => {
                  setEd(false);
                  t('Profile saved (simulated)');
                }}
              >
                Save changes
              </Btn>

              <Btn v="ghost" onClick={() => setEd(false)}>
                Cancel
              </Btn>
            </>
          ) : (
            <Btn onClick={() => setEd(true)}>
              Edit profile
            </Btn>
          )}
        </div>
      </Card>
    </>
  );
}
