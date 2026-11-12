
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createResponder,
  getResponders,
  getResponderById,
  updateResponder,
  deleteResponder,
} from '../controllers/responderController.js';

const router = Router();

router.use(protect);

router.get('/', getResponders);
router.get('/:id', getResponderById);

router.post('/', authorize('admin'), createResponder);
router.patch('/:id', authorize('admin'), updateResponder);
router.delete('/:id', authorize('admin'), deleteResponder);

export default router;
