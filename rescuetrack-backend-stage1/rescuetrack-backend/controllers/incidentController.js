
import mongoose from 'mongoose';
import Incident, {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
} from '../models/Incident.js';
import Responder from '../models/Responder.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const validId = (id) => mongoose.isValidObjectId(id);

const findIncident = async (id) => {
  const value = String(id).trim();

  const query = validId(value)
    ? { $or: [{ _id: value }, { incidentId: value.toUpperCase() }] }
    : { incidentId: value.toUpperCase() };

  const incident = await Incident.findOne(query);

  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  return incident;
};

const allowedFields = [
  'location',
  'latitude',
  'longitude',
  'accidentType',
  'severity',
  'description',
];

const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const validateFields = (body, allowed) => {
  const invalid = Object.keys(body).filter(
    (key) => !allowed.includes(key)
  );

  if (invalid.length) {
    throw new ApiError(
      400,
      `Unsupported fields: ${invalid.join(', ')}`
    );
  }
};

const parseDate = (value, field) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${field}`);
  }

  return date;
};

const populateIncident = (query) =>
  query.populate(
    'assignedResponder',
    'responderId name type availability contact currentLocation'
  );

// POST /api/incidents
export const createIncident = asyncHandler(async (req, res) => {
  validateFields(req.body, [...allowedFields, 'detectionTime']);

  const {
    location,
    latitude,
    longitude,
    accidentType,
    severity,
    description,
    detectionTime,
  } = req.body;

  if (
    !location ||
    latitude == null ||
    longitude == null ||
    !accidentType ||
    !severity
  ) {
    throw new ApiError(
      400,
      'Location, coordinates, accident type and severity are required'
    );
  }

  if (
    typeof latitude !== 'number' ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError(400, 'Invalid latitude or longitude');
  }

  if (!INCIDENT_SEVERITIES.includes(severity)) {
    throw new ApiError(400, 'Invalid incident severity');
  }

  const incident = await Incident.create({
    location,
    latitude,
    longitude,
    accidentType,
    severity,
    description,
    ...(detectionTime
      ? { detectionTime: parseDate(detectionTime, 'detectionTime') }
      : {}),
  });

  res.status(201).json({
    success: true,
    message: 'Incident created successfully',
    data: incident,
  });
});

// GET /api/incidents
export const getIncidents = asyncHandler(async (req, res) => {
  const { severity, status, search, startDate, endDate } = req.query;

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new ApiError(400, 'Invalid pagination values');
  }

  const filter = {};

  if (severity) {
    if (!INCIDENT_SEVERITIES.includes(severity)) {
      throw new ApiError(400, 'Invalid severity filter');
    }
    filter.severity = severity;
  }

  if (status) {
    if (!INCIDENT_STATUSES.includes(status)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    filter.status = status;
  }

  if (search) {
    if (typeof search !== 'string' || search.length > 100) {
      throw new ApiError(400, 'Invalid search value');
    }

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    filter.$or = [
      { incidentId: { $regex: escaped, $options: 'i' } },
      { location: { $regex: escaped, $options: 'i' } },
    ];
  }

  const from = parseDate(startDate, 'startDate');
  const to = parseDate(endDate, 'endDate');

  if (from && to && from > to) {
    throw new ApiError(400, 'startDate cannot exceed endDate');
  }

  if (from || to) {
    filter.detectionTime = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }

  const [incidents, total] = await Promise.all([
    populateIncident(
      Incident.find(filter)
        .sort({ detectionTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ),
    Incident.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: incidents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/incidents/:id
export const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await findIncident(req.params.id);
  await incident.populate(
    'assignedResponder',
    'responderId name type availability contact currentLocation'
  );

  res.json({ success: true, data: incident });
});

// PATCH /api/incidents/:id
export const updateIncident = asyncHandler(async (req, res) => {
  validateFields(req.body, allowedFields);

  const incident = await findIncident(req.params.id);

  for (const field of allowedFields) {
    if (hasOwn(req.body, field)) {
      incident[field] = req.body[field];
    }
  }

  await incident.save();

  res.json({
    success: true,
    message: 'Incident updated successfully',
    data: incident,
  });
});

// PATCH /api/incidents/:id/assign
export const assignResponder = asyncHandler(async (req, res) => {
  validateFields(req.body, ['responderId']);

  const { responderId } = req.body;

  if (
    typeof responderId !== 'string' ||
    !responderId.trim()
  ) {
    throw new ApiError(400, 'A valid responder ID is required');
  }

  const incident = await findIncident(req.params.id);

  if (incident.status === 'Resolved') {
    throw new ApiError(409, 'Cannot assign a resolved incident');
  }

  if (incident.assignedResponder) {
    throw new ApiError(409, 'Incident already has an assigned responder');
  }

  const id = responderId.trim();

  const responderFilter = validId(id)
    ? { _id: id }
    : { responderId: id.toUpperCase() };

  const responder = await Responder.findOneAndUpdate(
    {
      ...responderFilter,
      availability: true,
      assignedIncident: null,
    },
    {
      $set: {
        availability: false,
        assignedIncident: incident._id,
      },
    },
    { new: true, runValidators: true }
  );

  if (!responder) {
    throw new ApiError(
      409,
      'Responder not found or unavailable. Check the ID and availability.'
    );
  }

  try {
    incident.assignedResponder = responder._id;
    incident.status = 'Assigned';
    await incident.save();
  } catch (error) {
    await Responder.updateOne(
      {
        _id: responder._id,
        assignedIncident: incident._id,
      },
      {
        $set: {
          availability: true,
          assignedIncident: null,
        },
      }
    );

    throw error;
  }

  await incident.populate(
    'assignedResponder',
    'responderId name type availability contact currentLocation'
  );

  res.json({
    success: true,
    message: 'Responder assigned successfully',
    data: incident,
  });
});

// PATCH /api/incidents/:id/status
export const updateIncidentStatus = asyncHandler(async (req, res) => {
  validateFields(req.body, ['status', 'resolutionNotes']);

  const { status, resolutionNotes } = req.body;

  if (!INCIDENT_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid incident status');
  }

  const incident = await findIncident(req.params.id);

  if (incident.status === 'Resolved') {
    throw new ApiError(409, 'Resolved incidents cannot be reopened');
  }

  if (
    ['Assigned', 'Responding'].includes(status) &&
    !incident.assignedResponder
  ) {
    throw new ApiError(
      409,
      'Assign a responder before changing to this status'
    );
  }

  if (status === 'Active' && incident.assignedResponder) {
    throw new ApiError(
      409,
      'Cannot mark an assigned incident as Active'
    );
  }

  if (status === 'Resolved') {
    if (incident.assignedResponder) {
      await Responder.updateOne(
        {
          _id: incident.assignedResponder,
          assignedIncident: incident._id,
        },
        {
          $set: {
            availability: true,
            assignedIncident: null,
          },
        }
      );
    }

    incident.assignedResponder = null;
  }

  incident.status = status;

  if (hasOwn(req.body, 'resolutionNotes')) {
    incident.resolutionNotes = resolutionNotes;
  }

  if (status === 'Responding' && !incident.responseTime) {
    incident.responseTime = new Date();
  }

  await incident.save();

  res.json({
    success: true,
    message: 'Incident status updated successfully',
    data: incident,
  });
});

// PATCH /api/incidents/:id/resolve
export const resolveIncident = asyncHandler(async (req, res) => {
  req.body = {
    status: 'Resolved',
    ...(hasOwn(req.body, 'resolutionNotes')
      ? { resolutionNotes: req.body.resolutionNotes }
      : {}),
  };

  return updateIncidentStatus(req, res);
});
