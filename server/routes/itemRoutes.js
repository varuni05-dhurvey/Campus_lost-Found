const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  updateItemStatus
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public search/browse
router.get('/', getItems);

// Current user's reports (must come before /:id)
router.get('/mine', protect, getMyItems);

// Item details (supports optional auth to tailor visibility)
router.get('/:id', optionalAuth, getItemById);

// Create new report (with optional image upload)
router.post('/', protect, upload.single('image'), createItem);

// Update owned report
router.put('/:id', protect, upload.single('image'), updateItem);

// Delete owned report
router.delete('/:id', protect, deleteItem);

// Quick status change
router.patch('/:id/status', protect, updateItemStatus);

module.exports = router;
