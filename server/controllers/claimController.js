const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Submit a claim for an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const { itemId, message, identifyingEvidence, claimantContact } = req.body;

    if (!itemId || !message || !identifyingEvidence) {
      return res.status(400).json({
        success: false,
        message: 'Item ID, claim message, and identifying evidence are required.'
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Prevent users from claiming their own listings
    if (item.reporter.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item you reported.'
      });
    }

    // Check if item is already resolved
    if (item.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been marked as resolved/recovered.'
      });
    }

    // Check for existing pending claim by this claimant
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active claim submitted for this item.'
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      itemOwner: item.reporter,
      message: message.trim(),
      identifyingEvidence: identifyingEvidence.trim(),
      claimantContact: claimantContact ? claimantContact.trim() : req.user.phone || req.user.email,
      status: 'pending'
    });

    // Optionally set item status to claim_pending if it was found
    if (item.status === 'found') {
      item.status = 'claim_pending';
      await item.save();
    }

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title category campusLocation reportType status imageUrl')
      .populate('itemOwner', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Claim request submitted successfully! The reporter will review your evidence.',
      claim: populatedClaim
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims submitted by current user
// @route   GET /api/claims/mine
// @access  Private
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title category campusLocation reportType status imageUrl')
      .populate('itemOwner', 'name email department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims received for items reported by current user
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ itemOwner: req.user._id })
      .populate('item', 'title category campusLocation reportType status imageUrl')
      .populate('claimant', 'name email department phone role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status (approve, reject, complete)
// @route   PATCH /api/claims/:id/status
// @access  Private (Item Owner or Admin)
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, ownerFeedback } = req.body;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid claim status. Must be approved, rejected, or completed.'
      });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim request not found.'
      });
    }

    const isOwner = claim.itemOwner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this claim request.'
      });
    }

    claim.status = status;
    if (ownerFeedback !== undefined) {
      claim.ownerFeedback = ownerFeedback.trim();
    }
    claim.reviewedAt = new Date();
    await claim.save();

    // If claim is approved or completed, update item status accordingly
    const item = await Item.findById(claim.item);
    if (item) {
      if (status === 'completed' || status === 'approved') {
        item.status = 'resolved';
        await item.save();
      } else if (status === 'rejected') {
        // If rejected, check if there are any other pending claims
        const otherPending = await Claim.countDocuments({
          item: item._id,
          _id: { $ne: claim._id },
          status: 'pending'
        });
        if (otherPending === 0 && item.status === 'claim_pending') {
          item.status = item.reportType === 'lost' ? 'lost' : 'found';
          await item.save();
        }
      }
    }

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title category campusLocation reportType status imageUrl')
      .populate('claimant', 'name email department phone');

    res.status(200).json({
      success: true,
      message: `Claim request has been marked as ${status}.`,
      claim: populatedClaim
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus
};
