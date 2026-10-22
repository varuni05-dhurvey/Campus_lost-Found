const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required']
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant user is required']
    },
    itemOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item owner user is required']
    },
    message: {
      type: String,
      required: [true, 'Please explain your claim request'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    identifyingEvidence: {
      type: String,
      required: [true, 'Please provide identifying evidence proving your ownership'],
      trim: true,
      minlength: [10, 'Evidence description must be at least 10 characters long'],
      maxlength: [1000, 'Evidence description cannot exceed 1000 characters']
    },
    claimantContact: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact detail cannot exceed 100 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    ownerFeedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
      default: ''
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate pending claims from the same claimant for the same item
claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ itemOwner: 1, status: 1 });
claimSchema.index({ claimant: 1, createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
