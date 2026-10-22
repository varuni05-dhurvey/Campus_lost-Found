const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminItems,
  moderateItem,
  deleteAdminItem,
  getAdminUsers
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/items', getAdminItems);
router.patch('/items/:id/moderate', moderateItem);
router.delete('/items/:id', deleteAdminItem);
router.get('/users', getAdminUsers);

module.exports = router;
