
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  assignResponder,
  updateIncidentStatus,
  resolveIncident,
} from '../controllers/incidentController.js';

const router = Router();

// All incident routes require authentication.
router.use(protect);

// View incidents — authenticated users
router.get('/', getIncidents);
router.get('/:id', getIncidentById);

// Administrator-only actions
router.post('/', authorize('admin'), createIncident);
router.patch('/:id', authorize('admin'), updateIncident);

// Only administrators can assign responders.
router.patch(
  '/:id/assign',
  authorize('admin'),
  assignResponder
);

// Administrators and responders can update incident status.
router.patch(
  '/:id/status',
  authorize('admin', 'responder'),
  updateIncidentStatus
);

router.patch(
  '/:id/resolve',
  authorize('admin', 'responder'),
  resolveIncident
);

export default router;
