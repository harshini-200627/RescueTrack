
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Siren,
  Activity,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  MapPin,
  Radio,
  ShieldCheck,
  Navigation,
} from 'lucide-react';

import {
  Card,
  Badge,
  PageHead,
  Spinner,
  Select,
  Btn,
  useToast,
  fmt,
} from '../components/ui';

import {
  api,
  Incident,
  Status,
} from '../lib/mockApi';

import { useData } from '../lib/hooks';

/* -----------------------------------------
   RescueTrack map pin configuration
------------------------------------------ */

const pinColors: Record<string, string> = {
  Critical: '#B96660',
  Moderate: '#C69A60',
  Minor: '#608F83',
};

function createIncidentPin(severity: string) {
  const color = pinColors[severity] ?? '#608F83';

  return L.divIcon({
    className: 'rt-leaflet-icon',
    html: `
      <svg
        class="rt-pin-svg"
        width="40"
        height="48"
        viewBox="0 0 40 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 46 C15 38 3 27 3 18 A17 17 0 1 1 37 18 C37 27 25 38 20 46 Z"
          fill="${color}"
          stroke="#F4F7F8"
          stroke-width="1.6"
        />
        <circle cx="20" cy="18" r="11" fill="#F7F8F7" />
        <path
          d="M20 11 L14.5 20 H18 L17 25 L25.5 16 H21.5 L23 11 Z"
          fill="#263746"
        />
      </svg>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
  });
}

/* -----------------------------------------
   Dashboard
------------------------------------------ */

export function Dashboard() {
  const { inc, res } = useData();

  if (!inc || !res) return <Spinner />;

  // Illustrative demo figures, not live emergency data.
  const summary = {
    accidentsToday: 18,
    activeIncidents: 5,
    resolvedCases: 13,
    emergencyAlerts: 27,
    urbanResponse: 7,
    highwayResponse: 11,
    monthlyTotal: 320,
    monthlyResolved: 295,
    monthlyCritical: 25,
  };

  const alerts = [
    {
      location: 'NH16 Highway',
      type: 'Bike collision',
      severity: 'Critical',
      status: 'Active',
      time: '10:42 AM',
    },
    {
      location: 'Pedagadi Junction',
      type: 'Car crash',
      severity: 'Moderate',
      status: 'Resolved',
      time: '10:18 AM',
    },
    {
      location: 'MVP Colony',
      type: 'Truck accident',
      severity: 'Critical',
      status: 'Active',
      time: '09:56 AM',
    },
    {
      location: 'Beach Road',
      type: 'Pedestrian accident',
      severity: 'Minor',
      status: 'Resolved',
      time: '09:30 AM',
    },
  ];

  const monthlyTrend = [
    { month: 'May', accidents: 238, resolved: 216 },
    { month: 'Jun', accidents: 264, resolved: 243 },
    { month: 'Jul', accidents: 251, resolved: 230 },
    { month: 'Aug', accidents: 286, resolved: 262 },
    { month: 'Sep', accidents: 302, resolved: 277 },
    { month: 'Oct', accidents: 320, resolved: 295 },
  ];

  const severityData = [
    { name: 'Critical', value: 25, color: '#B96660' },
    { name: 'Moderate', value: 112, color: '#C69A60' },
    { name: 'Minor', value: 183, color: '#608F83' },
  ];

  const hotspots = [
    { name: 'NH16 Highway', cases: 5, risk: 'High' },
    { name: 'MVP Colony', cases: 4, risk: 'High' },
    { name: 'Pedagadi Junction', cases: 3, risk: 'Moderate' },
  ];

  const availableUnits = (type: string) =>
    res.filter(
      (responder) =>
        responder.type === type &&
        responder.status === 'Available'
    ).length;

  const totalUnits = (type: string) =>
    res.filter((responder) => responder.type === type).length;

  const stats = [
    {
      label: 'Total Accidents Today',
      value: summary.accidentsToday,
      note: 'Illustrative daily total',
      icon: <Siren size={21} />,
      color: '#B96660',
    },
    {
      label: 'Active Incidents',
      value: summary.activeIncidents,
      note: 'Require response',
      icon: <AlertTriangle size={21} />,
      color: '#C69A60',
    },
    {
      label: 'Resolved Cases',
      value: summary.resolvedCases,
      note: 'Illustrative resolved total',
      icon: <CheckCircle2 size={21} />,
      color: '#608F83',
    },
    {
      label: 'Emergency Calls / Alerts',
      value: summary.emergencyAlerts,
      note: 'Illustrative alert count',
      icon: <Radio size={21} />,
      color: '#647D91',
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      <PageHead
        title="Emergency Operations Center"
        sub="RescueTrack · Accident monitoring and emergency response"
      />

      {/* Compact mountain-road welcome banner */}
      <section className="rt-welcome-banner">
        <div className="rt-welcome-banner-content">
          <h2>Welcome Back, Responder!</h2>
          <p>
            “Every second matters. Every life counts. Your response makes
            the difference.”
          </p>
        </div>
      </section>

      {/* Demo data notice */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5D7BD] bg-[#FBF5E9] px-4 py-3 text-sm text-[#795F36]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
          <Activity size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <strong>Demonstration dashboard</strong>
          <p className="mt-1 text-xs">
            Sample figures and fictional incident records. Not a live
            emergency feed.
          </p>
        </div>
        <span className="rounded-full border border-[#D8C5A2] px-3 py-1 text-xs font-semibold">
          DEMO DATA
        </span>
      </div>

      {/* Primary statistics */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-[#263746]">
            Situation Overview
          </h2>
          <p className="mt-1 text-sm text-slate2">
            Key emergency response indicators
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate2">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-[#263746]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs text-slate2">
                    {item.note}
                  </p>
                </div>

                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    color: item.color,
                    background: `${item.color}16`,
                  }}
                >
                  {item.icon}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent alerts and responder availability */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#263746]">
                Recent Accident Alerts
              </h2>
              <p className="mt-1 text-sm text-slate2">
                Illustrative incident records
              </p>
            </div>

            <Link
              to="/history"
              className="text-sm font-semibold text-[#608F83] hover:underline"
            >
              View history →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-slate2">
                  <th className="px-3 py-3 font-semibold">
                    Location / Time
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Incident type
                  </th>
                  <th className="px-3 py-3 font-semibold">Severity</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {alerts.map((alert) => (
                  <tr
                    key={alert.location}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#B96660]"
                        />
                        <div>
                          <p className="font-semibold text-[#263746]">
                            {alert.location}
                          </p>
                          <p className="mt-1 text-xs text-slate2">
                            {alert.time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-slate2">
                      {alert.type}
                    </td>
                    <td className="px-3 py-4">
                      <Badge t={alert.severity} />
                    </td>
                    <td className="px-3 py-4">
                      <Badge t={alert.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate2">
            Sample records are for interface demonstration only.
          </p>
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-2">
            <Truck size={19} className="text-[#608F83]" />
            <h2 className="font-bold text-[#263746]">
              Responder Availability
            </h2>
          </div>

          <p className="mb-5 text-sm text-slate2">
            Availability from the development dataset
          </p>

          {[
            { type: 'Ambulance', label: 'Ambulances' },
            { type: 'Police', label: 'Police units' },
            { type: 'Fire', label: 'Fire trucks' },
          ].map((unit) => {
            const available = availableUnits(unit.type);
            const total = totalUnits(unit.type);
            const percentage =
              total > 0 ? (available / total) * 100 : 0;

            return (
              <div key={unit.type} className="mb-5 last:mb-0">
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-[#263746]">
                    {unit.label}
                  </span>
                  <span className="font-semibold">
                    {available} / {total}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#E9ECE8]">
                  <div
                    className="h-full rounded-full bg-[#608F83] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate2">
                  {available} available
                </p>
              </div>
            );
          })}

          <div className="mt-6 rounded-xl border border-line bg-[#F7F8F5] p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#608F83]" />
              <h3 className="text-sm font-bold text-[#263746]">
                Unit Status
              </h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate2">
              These counts do not represent verified real-world
              availability.
            </p>
          </div>

          <Link
            to="/responders"
            className="mt-4 inline-block text-sm font-semibold text-[#608F83] hover:underline"
          >
            Manage responders →
          </Link>
        </Card>
      </section>

      {/* Response performance and accident-prone areas */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F3F0] text-[#608F83]">
              <Clock size={20} />
            </span>
            <div>
              <h2 className="font-bold text-[#263746]">
                Response Performance
              </h2>
              <p className="mt-1 text-sm text-slate2">
                Illustrative average response times
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-slate2">Urban areas</p>
              <p className="mt-2 text-3xl font-bold text-[#263746]">
                {summary.urbanResponse}
                <span className="ml-1 text-sm font-medium text-slate2">
                  min
                </span>
              </p>
              <p className="mt-2 text-xs text-slate2">
                Example response time
              </p>
            </div>

            <div className="rounded-xl border border-line p-4">
              <p className="text-sm text-slate2">Highways</p>
              <p className="mt-2 text-3xl font-bold text-[#263746]">
                {summary.highwayResponse}
                <span className="ml-1 text-sm font-medium text-slate2">
                  min
                </span>
              </p>
              <p className="mt-2 text-xs text-slate2">
                Example response time
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate2">
            These values are examples, not measured emergency response
            times.
          </p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={19} className="text-[#B96660]" />
            <div>
              <h2 className="font-bold text-[#263746]">
                Accident-Prone Areas
              </h2>
              <p className="mt-1 text-sm text-slate2">
                Illustrative hotspot ranking
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {hotspots.map((spot, index) => (
              <div key={spot.name} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F0] text-sm font-bold text-[#526A63]">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#263746]">
                    {spot.name}
                  </p>
                  <p className="mt-1 text-xs text-slate2">
                    {spot.cases} example cases
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    spot.risk === 'High'
                      ? 'bg-[#F7E9E6] text-[#A65F58]'
                      : 'bg-[#F7F0E3] text-[#94713D]'
                  }`}
                >
                  {spot.risk} risk
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-slate2">
            Hotspot rankings are fictional examples.
          </p>
        </Card>
      </section>

      {/* Monthly accident statistics */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#263746]">
                Monthly Accident Statistics
              </h2>
              <p className="mt-1 text-sm text-slate2">
                Six-month illustrative trend
              </p>
            </div>

            <span className="rounded-lg bg-[#F1F3F0] px-3 py-2 text-xs font-semibold text-[#526A63]">
              May – October
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate2">Total</p>
              <p className="mt-1 text-xl font-bold text-[#263746]">
                {summary.monthlyTotal}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate2">Resolved</p>
              <p className="mt-1 text-xl font-bold text-[#608F83]">
                {summary.monthlyResolved}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate2">Critical</p>
              <p className="mt-1 text-xl font-bold text-[#B96660]">
                {summary.monthlyCritical}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrend}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="accidents"
                  name="Total accidents"
                  stroke="#647D91"
                  fill="#647D91"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved cases"
                  stroke="#608F83"
                  fill="#608F83"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs text-slate2">
            All monthly chart values are illustrative.
          </p>
        </Card>

        <Card>
          <h2 className="font-bold text-[#263746]">
            Severity Analysis
          </h2>
          <p className="mt-1 text-sm text-slate2">
            Example incident distribution
          </p>

          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={83}
                  paddingAngle={3}
                >
                  {severityData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {severityData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-slate2">{item.name}</span>
                </span>
                <strong className="text-[#263746]">
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate2">
            Example distribution only; not a live calculation.
          </p>
        </Card>
      </section>

      {/* Quick navigation */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          to="/live-map"
          className="flex items-center justify-between rounded-xl border border-line bg-white p-4 transition hover:border-[#608F83]"
        >
          <span className="flex items-center gap-3">
            <MapPin size={20} className="text-[#608F83]" />
            <span>
              <strong className="block text-sm text-[#263746]">
                Live Incident Map
              </strong>
              <span className="mt-1 block text-xs text-slate2">
                View mapped incident records
              </span>
            </span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          to="/responders"
          className="flex items-center justify-between rounded-xl border border-line bg-white p-4 transition hover:border-[#608F83]"
        >
          <span className="flex items-center gap-3">
            <Truck size={20} className="text-[#608F83]" />
            <span>
              <strong className="block text-sm text-[#263746]">
                Manage Responders
              </strong>
              <span className="mt-1 block text-xs text-slate2">
                Review responder records
              </span>
            </span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          to="/reports"
          className="flex items-center justify-between rounded-xl border border-line bg-white p-4 transition hover:border-[#608F83]"
        >
          <span className="flex items-center gap-3">
            <Activity size={20} className="text-[#608F83]" />
            <span>
              <strong className="block text-sm text-[#263746]">
                Reports & Analytics
              </strong>
              <span className="mt-1 block text-xs text-slate2">
                Open reporting section
              </span>
            </span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}

/* -----------------------------------------
   Live incident map
------------------------------------------ */

export function LiveMap() {
  const { inc } = useData();

  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');

  if (!inc) return <Spinner />;

  const incidents = inc.filter(
    (incident) =>
      (severity === 'All' || incident.severity === severity) &&
      (status === 'All' || incident.status === status)
  );

  return (
    <>
      <PageHead
        title="Live Incident Map"
        sub="Geospatial incident monitoring · Simulated development data"
      >
        <div className="flex flex-wrap gap-2">
          <Select
            label="Severity"
            value={severity}
            onChange={setSeverity}
            opts={['All', 'Critical', 'Moderate', 'Minor']}
          />

          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            opts={[
              'All',
              'Reported',
              'Dispatched',
              'In Progress',
              'Resolved',
            ]}
          />
        </div>
      </PageHead>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rt-map-shell card overflow-hidden">
          <div className="rt-map-heading">
            <div>
              <h2>Geospatial intelligence</h2>
              <p>{incidents.length} matching incidents</p>
            </div>
            <div className="rt-map-status">
              <span className="rt-status-dot" />
              Demo feed
            </div>
          </div>

          <div className="rt-map-canvas">
            <MapContainer
              center={[16.37, 80.45]}
              zoom={10}
              className="h-full w-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {incidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={[incident.lat, incident.lng]}
                  icon={createIncidentPin(incident.severity)}
                >
                  <Popup>
                    <div className="rt-popup">
                      <div className="rt-popup-label">
                        INCIDENT RECORD
                      </div>
                      <strong>{incident.id}</strong>
                      <p>{incident.location}</p>
                      <div className="rt-popup-meta">
                        <span>{incident.severity}</span>
                        <span>{incident.status}</span>
                      </div>
                      <Link to={`/incident-details/${incident.id}`}>
                        Open incident details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="rt-map-legend">
            <span>
              <i className="rt-legend-pin critical" />
              Critical
            </span>
            <span>
              <i className="rt-legend-pin moderate" />
              Moderate
            </span>
            <span>
              <i className="rt-legend-pin minor" />
              Minor
            </span>
          </div>
        </div>

        <Card className="rt-incident-panel">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Incident Feed</h2>
              <p className="text-sm text-slate2">Filtered records</p>
            </div>
            <MapPin size={20} />
          </div>

          {incidents.length === 0 && (
            <p className="text-sm text-slate2">
              No incidents match these filters.
            </p>
          )}

          {incidents.slice(0, 15).map((incident) => (
            <Link
              key={incident.id}
              to={`/incident-details/${incident.id}`}
              className="rt-incident-row"
            >
              <span
                className="rt-incident-marker"
                style={{
                  background:
                    pinColors[incident.severity] ?? '#608F83',
                }}
              >
                <MapPin size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <strong>{incident.id}</strong>
                <span className="rt-incident-location">
                  {incident.location}
                </span>
                <span className="rt-incident-status">
                  {incident.status}
                </span>
              </span>
              <span
                className="rt-severity-label"
                style={{
                  color:
                    pinColors[incident.severity] ?? '#608F83',
                }}
              >
                {incident.severity}
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </>
  );
}

/* -----------------------------------------
   Incident details
------------------------------------------ */

export function IncidentDetails() {
  const { id } = useParams();

  const [incident, setIncident] =
    useState<Incident | null | undefined>();

  const [responders, setResponders] = useState<
    { id: string; name: string; status: string }[]
  >([]);

  const [note, setNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const toast = useToast();

  const loadIncident = () => api.incident(id!).then(setIncident);

  useEffect(() => {
    loadIncident();
    api.responders().then(setResponders);
  }, [id]);

  if (incident === undefined) return <Spinner />;

  if (incident === null) {
    return (
      <Card>
        Incident not found.{' '}
        <Link className="underline" to="/history">
          Back to history
        </Link>
      </Card>
    );
  }

  return (
    <>
      <PageHead
        title={incident.id}
        sub={`${incident.location} · detected ${fmt(incident.detectedAt)}`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge t={incident.severity} />
          <Badge t={incident.status} />
        </div>
      </PageHead>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={20} />
            <h2 className="font-bold">Incident Information</h2>
          </div>

          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-slate2">GPS coordinates</dt>
            <dd>
              {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}
            </dd>
            <dt className="text-slate2">Detection source</dt>
            <dd>{incident.source}</dd>
            <dt className="text-slate2">Vehicle</dt>
            <dd>{incident.vehicle}</dd>
            <dt className="text-slate2">Response time</dt>
            <dd>{incident.responseMin ?? '—'} min</dd>
          </dl>

          <h3 className="mb-2 mt-6 font-bold">
            Responder Assignment
          </h3>

          <select
            className="inp"
            value={incident.responderId ?? ''}
            disabled={assigning}
            onChange={async (event) => {
              const responderId = event.target.value;
              if (!responderId || assigning) return;

              setAssigning(true);
              try {
                await api.assign(incident.id, responderId);
                toast('Responder assigned successfully!');
                await loadIncident();
                const updatedResponders = await api.responders();
                setResponders(updatedResponders);
              } catch (error) {
                toast(
                  error instanceof Error
                    ? error.message
                    : 'Failed to assign responder. Please try again.',
                );
                await loadIncident().catch(() => undefined);
              } finally {
                setAssigning(false);
              }
            }}
          >
            <option value="" disabled>
              Choose a unit
            </option>
            {responders
              .filter(
                (responder) =>
                  responder.status === 'Available' ||
                  responder.id === incident.responderId
              )
              .map((responder) => (
                <option key={responder.id} value={responder.id}>
                  {responder.id} · {responder.name}
                </option>
              ))}
          </select>

          <h3 className="mb-2 mt-6 font-bold">Incident Status</h3>

          <div className="flex flex-wrap gap-2">
            {(
              [
                'Reported',
                'Dispatched',
                'In Progress',
                'Resolved',
              ] as Status[]
            ).map((nextStatus) => (
              <Btn
                key={nextStatus}
                v={nextStatus === incident.status ? 'primary' : 'ghost'}
                onClick={async () => {
                  await api.setStatus(incident.id, nextStatus);
                  toast(`Status set to ${nextStatus}`);
                  loadIncident();
                }}
              >
                {nextStatus}
              </Btn>
            ))}
          </div>
        </Card>

        <div className="rt-map-shell card overflow-hidden">
          <div className="rt-map-heading">
            <div>
              <h2>Incident Location</h2>
              <p>GPS-based location view</p>
            </div>
            <Navigation size={20} />
          </div>

          <div className="h-80 lg:h-full lg:min-h-96">
            <MapContainer
              key={incident.id}
              center={[incident.lat, incident.lng]}
              zoom={13}
              className="h-full min-h-80 w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[incident.lat, incident.lng]}
                icon={createIncidentPin(incident.severity)}
              >
                <Popup>
                  <strong>{incident.id}</strong>
                  <br />
                  {incident.location}
                  <br />
                  {incident.severity}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-bold">Timeline and Notes</h2>

          <ol className="space-y-3 border-l-2 border-line pl-4 text-sm">
            <li>{fmt(incident.detectedAt)} — detected</li>
            {incident.notes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>

          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!note.trim()) return;

              await api.addNote(
                incident.id,
                `${new Date().toLocaleTimeString()} — ${note}`
              );

              setNote('');
              toast('Note added');
              loadIncident();
            }}
          >
            <input
              className="inp"
              placeholder="Add an incident note..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Btn>Add Note</Btn>
          </form>
        </Card>
      </div>
    </>
  );
}
