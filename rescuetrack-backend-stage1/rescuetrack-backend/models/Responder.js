import mongoose from 'mongoose';

export const RESPONDER_TYPES = ['Ambulance', 'Police', 'Fire'];

const responderSchema = new mongoose.Schema(
  {
    responderId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Responder name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Contact phone number is required'],
        trim: true,
        match: [/^[+()\-\s\d]{7,20}$/, 'Please provide a valid phone number'],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid contact email'],
      },
    },
    type: {
      type: String,
      required: [true, 'Responder type is required'],
      enum: {
        values: RESPONDER_TYPES,
        message: 'Responder type must be Ambulance, Police or Fire',
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      address: { type: String, trim: true, maxlength: 250 },
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    assignedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    // Optional link to the login account of this responder.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

responderSchema.index({ type: 1, availability: 1 });
responderSchema.index({ assignedIncident: 1 });
responderSchema.index({ user: 1 }, { sparse: true });

const Responder = mongoose.models.Responder || mongoose.model('Responder', responderSchema);

export default Responder;
