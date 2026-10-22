const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

// All claim routes require authentication
router.use(protect);

router.post('/', createClaim);
router.get('/mine', getMyClaims);
router.get('/received', getReceivedClaims);
router.patch('/:id/status', updateClaimStatus);

module.exports = router;
