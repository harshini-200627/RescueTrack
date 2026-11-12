import mongoose from 'mongoose';
import crypto from 'crypto';

export const INCIDENT_SEVERITIES = ['Critical', 'Moderate', 'Minor'];
export const INCIDENT_STATUSES = ['Active', 'Assigned', 'Responding', 'Resolved'];

/**
 * Generates a human-readable unique incident ID, e.g. INC-20261016-A1B2C3.
 * Uniqueness is guaranteed by the unique index; collisions are astronomically unlikely.
 */
export const generateIncidentId = (date = new Date()) => {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INC-${stamp}-${suffix}`;
};

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      default: () => generateIncidentId(),
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [250, 'Location must be at most 250 characters'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    accidentType: {
      type: String,
      required: [true, 'Accident type is required'],
      trim: true,
      maxlength: [100, 'Accident type must be at most 100 characters'],
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: INCIDENT_SEVERITIES,
        message: 'Severity must be Critical, Moderate or Minor',
      },
    },
    status: {
      type: String,
      enum: {
        values: INCIDENT_STATUSES,
        message: 'Status must be Active, Assigned, Responding or Resolved',
      },
      default: 'Active',
    },
    detectionTime: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be at most 2000 characters'],
      default: '',
    },
    assignedResponder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Responder',
      default: null,
    },
    responseTime: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution notes must be at most 2000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

incidentSchema.index({ status: 1, severity: 1 });
incidentSchema.index({ detectionTime: -1 });
incidentSchema.index({ assignedResponder: 1 });
incidentSchema.index({ latitude: 1, longitude: 1 });

const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);

export default Incident;
