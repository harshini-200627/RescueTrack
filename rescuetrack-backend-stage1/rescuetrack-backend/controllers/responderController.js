
import mongoose from 'mongoose';
import Responder, { RESPONDER_TYPES } from '../models/Responder.js';
import Incident from '../models/Incident.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const validId = (id) => mongoose.isValidObjectId(id);

// Generate sequential human-readable responder IDs.
const generateResponderId = async () => {
  const Counter =
    mongoose.models.ResponderCounter ||
    mongoose.model(
      'ResponderCounter',
      new mongoose.Schema({
        _id: String,
        seq: { type: Number, default: 0 },
      }),
      'counters'
    );

  const counter = await Counter.findOneAndUpdate(
    { _id: 'responderId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `RES-${String(counter.seq).padStart(4, '0')}`;
};

const findResponder = (id) =>
  Responder.findOne(
    validId(id)
      ? { _id: id }
      : { responderId: id }
  );

export const createResponder = asyncHandler(async (req, res) => {
  const { name, contact, type, availability, currentLocation } = req.body;

  if (!name || !contact?.phone || !type) {
    throw new ApiError(
      400,
      'Name, contact phone and responder type are required'
    );
  }

  if (!RESPONDER_TYPES.includes(type)) {
    throw new ApiError(400, 'Type must be Ambulance, Police or Fire');
  }

  const responderId = await generateResponderId();

  const responder = await Responder.create({
    responderId,
    name,
    contact,
    type,
    availability: availability ?? true,
    currentLocation,
  });

  res.status(201).json({
    success: true,
    message: 'Responder created successfully',
    data: responder,
  });
});

export const getResponders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.type) {
    if (!RESPONDER_TYPES.includes(req.query.type)) {
      throw new ApiError(400, 'Invalid responder type');
    }
    filter.type = req.query.type;
  }

  if (req.query.availability !== undefined) {
    if (!['true', 'false'].includes(req.query.availability)) {
      throw new ApiError(400, 'Availability must be true or false');
    }
    filter.availability = req.query.availability === 'true';
  }

  const responders = await Responder.find(filter)
    .populate('assignedIncident', 'incidentId location severity status')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: responders.length,
    data: responders,
  });
});

export const getResponderById = asyncHandler(async (req, res) => {
  const responder = await findResponder(req.params.id)
    .populate('assignedIncident', 'incidentId location severity status');

  if (!responder) {
    throw new ApiError(404, 'Responder not found');
  }

  res.status(200).json({ success: true, data: responder });
});

export const updateResponder = asyncHandler(async (req, res) => {
  const responder = await findResponder(req.params.id);

  if (!responder) {
    throw new ApiError(404, 'Responder not found');
  }

  const allowed = [
    'name',
    'contact',
    'type',
    'availability',
    'currentLocation',
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      responder[key] = req.body[key];
    }
  }

  if (!RESPONDER_TYPES.includes(responder.type)) {
    throw new ApiError(400, 'Type must be Ambulance, Police or Fire');
  }

  await responder.save();

  res.status(200).json({
    success: true,
    message: 'Responder updated successfully',
    data: responder,
  });
});

export const deleteResponder = asyncHandler(async (req, res) => {
  const responder = await findResponder(req.params.id);

  if (!responder) {
    throw new ApiError(404, 'Responder not found');
  }

  if (responder.assignedIncident) {
    const incident = await Incident.findById(responder.assignedIncident);

    if (incident && incident.status !== 'Resolved') {
      throw new ApiError(
        409,
        'Cannot delete a responder assigned to an unresolved incident'
      );
    }
  }

  await responder.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Responder deleted successfully',
  });
});
