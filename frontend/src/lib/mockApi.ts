
const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:5000/api';

export { API_BASE };

export type Severity = 'Critical' | 'Moderate' | 'Minor';
export type Status = 'Reported' | 'Dispatched' | 'In Progress' | 'Resolved';

export interface Responder {
  id: string;
  name: string;
  type: 'Ambulance' | 'Police' | 'Fire';
  status: 'Available' | 'Busy' | 'Offline';
  zone: string;
}

export interface Incident {
  id: string;
  lat: number;
  lng: number;
  location: string;
  detectedAt: string;
  severity: Severity;
  status: Status;
  source: string;
  vehicle: string;
  responderId?: string;
  responseMin: number | null;
  notes: string[];
}

interface BackendResponder {
  _id?: string;
  responderId?: string;
  name?: string;
  type?: string;
  availability?: boolean;
  contact?: {
    phone?: string;
  };
  currentLocation?: unknown;
  assignedIncident?: unknown;
}

interface BackendIncident {
  _id?: string;
  incidentId?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  detectionTime?: string;
  createdAt?: string;
  severity?: string;
  status?: string;
  accidentType?: string;
  description?: string;
  resolutionNotes?: string;
  responseTime?: string;
  assignedResponder?: BackendResponder | string | null;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: unknown;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

async function backendRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem('rt_token');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok || data.success === false) {
    if (response.status === 401) {
      sessionStorage.removeItem('rt_token');
      sessionStorage.removeItem('rt_user');
    }

    throw new Error(
      data.message || `Request failed (${response.status})`,
    );
  }

  return data as T;
}

function mapSeverity(value?: string): Severity {
  const severity = value?.toLowerCase();

  if (severity === 'critical') return 'Critical';
  if (severity === 'minor' || severity === 'low') return 'Minor';

  return 'Moderate';
}

function mapStatus(value?: string): Status {
  switch (value) {
    case 'Assigned':
    case 'Dispatched':
      return 'Dispatched';

    case 'Responding':
    case 'In Progress':
      return 'In Progress';

    case 'Resolved':
      return 'Resolved';

    case 'Active':
    case 'Reported':
    default:
      return 'Reported';
  }
}

function backendStatus(status: Status): string {
  switch (status) {
    case 'Reported':
      return 'Active';
    case 'Dispatched':
      return 'Assigned';
    case 'In Progress':
      return 'Responding';
    case 'Resolved':
      return 'Resolved';
  }
}

function getResponderId(
  responder: BackendIncident['assignedResponder'],
): string | undefined {
  if (!responder) return undefined;

  if (typeof responder === 'string') return responder;

  return responder.responderId || responder._id;
}

function mapIncident(item: BackendIncident): Incident {
  const detectedAt =
    item.detectionTime || item.createdAt || new Date().toISOString();

  const responseTime = item.responseTime
    ? new Date(item.responseTime).getTime()
    : NaN;

  const detectionTime = new Date(detectedAt).getTime();

  const responseMin =
    Number.isFinite(responseTime) && Number.isFinite(detectionTime)
      ? Math.max(0, Math.round((responseTime - detectionTime) / 60000))
      : null;

  const notes = [
    item.description,
    item.resolutionNotes,
  ].filter((note): note is string => Boolean(note?.trim()));

  return {
    id: item.incidentId || item._id || '',
    lat: item.latitude ?? 0,
    lng: item.longitude ?? 0,
    location: item.location || 'Location unavailable',
    detectedAt,
    severity: mapSeverity(item.severity),
    status: mapStatus(item.status),
    source: 'RescueTrack backend',
    vehicle: item.accidentType || 'Unknown',
    responderId: getResponderId(item.assignedResponder),
    responseMin,
    notes,
  };
}

function mapResponder(item: BackendResponder): Responder {
  const location =
    typeof item.currentLocation === 'string'
      ? item.currentLocation
      : item.currentLocation &&
          typeof item.currentLocation === 'object'
        ? JSON.stringify(item.currentLocation)
        : 'Unspecified';

  return {
    id: item.responderId || item._id || '',
    name: item.name || 'Unnamed responder',
    type:
      item.type === 'Police' || item.type === 'Fire'
        ? item.type
        : 'Ambulance',
    status: item.availability ? 'Available' : 'Busy',
    zone: location,
  };
}

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];

  if (response && typeof response === 'object') {
    const object = response as {
      data?: unknown;
      incidents?: unknown;
      responders?: unknown;
    };

    if (Array.isArray(object.data)) return object.data as T[];
    if (Array.isArray(object.incidents)) return object.incidents as T[];
    if (Array.isArray(object.responders)) return object.responders as T[];
  }

  return [];
}

export const api = {
  // REAL BACKEND LOGIN
  async login(email: string, pw: string) {
    const data = await backendRequest<ApiResponse<unknown>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password: pw,
      }),
    });

    if (!data.token) {
      throw new Error('No authentication token was returned.');
    }

    sessionStorage.setItem('rt_token', data.token);
    sessionStorage.setItem('rt_user', JSON.stringify(data.user));

    return data;
  },

  // REAL BACKEND SIGNUP
  async signup(details: Record<string, string>) {
    const data = await backendRequest<ApiResponse<unknown>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: details.name,
        email: details.email?.trim(),
        password: details.password,
      }),
    });

    // The backend creates responder accounts during signup.
    // Keep the existing behavior: do not automatically log in.
    return data;
  },

  // LOGOUT
  logout() {
    sessionStorage.removeItem('rt_token');
    sessionStorage.removeItem('rt_user');
    sessionStorage.removeItem('rescuetrack-remember');
  },

  // Checks whether a token is stored locally.
  isAuthed: () => !!sessionStorage.getItem('rt_token'),

  // REAL BACKEND INCIDENT LIST
  async incidents(): Promise<Incident[]> {
    const response = await backendRequest<ApiResponse<BackendIncident[]>>(
      '/incidents?page=1&limit=100',
    );

    return extractList<BackendIncident>(response).map(mapIncident);
  },

  // REAL BACKEND SINGLE INCIDENT
  async incident(id: string): Promise<Incident | null> {
    try {
      const response = await backendRequest<ApiResponse<BackendIncident>>(
        `/incidents/${encodeURIComponent(id)}`,
      );

      if (!response.data) return null;

      return mapIncident(response.data);
    } catch (error) {
      if (error instanceof Error && error.message === 'Incident not found') {
        return null;
      }

      throw error;
    }
  },

  // REAL BACKEND RESPONDER LIST
  async responders(): Promise<Responder[]> {
    const response = await backendRequest<ApiResponse<BackendResponder[]>>(
      '/responders',
    );

    return extractList<BackendResponder>(response).map(mapResponder);
  },

  // ASSIGN A RESPONDER TO AN INCIDENT
  async assign(iid: string, rid: string): Promise<boolean> {
    await backendRequest<ApiResponse<BackendIncident>>(
      `/incidents/${encodeURIComponent(iid)}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify({ responderId: rid }),
      },
    );

    return true;
  },

  // UPDATE INCIDENT STATUS
  async setStatus(iid: string, status: Status): Promise<boolean> {
    await backendRequest<ApiResponse<BackendIncident>>(
      `/incidents/${encodeURIComponent(iid)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: backendStatus(status) }),
      },
    );

    return true;
  },

  // The backend currently has no dedicated add-note endpoint.
  async addNote(_iid: string, _note: string): Promise<boolean> {
    throw new Error(
      'Adding incident notes is not supported by the backend yet.',
    );
  },
};

export const sevColor = {
  Critical: '#b94a48',
  Moderate: '#c58a2b',
  Minor: '#6f9a7a',
} as const;

export function toCSV(rows: Incident[]) {
  const header =
    'id,detected_at,location,lat,lng,severity,status,vehicle,response_min';

  const escapeCSV = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  return [
    header,
    ...rows.map((row) =>
      [
        escapeCSV(row.id),
        escapeCSV(row.detectedAt),
        escapeCSV(row.location),
        row.lat.toFixed(5),
        row.lng.toFixed(5),
        escapeCSV(row.severity),
        escapeCSV(row.status),
        escapeCSV(row.vehicle),
        row.responseMin ?? '',
      ].join(','),
    ),
  ].join('\n');
}
