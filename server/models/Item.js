const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1500, 'Description cannot exceed 1500 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select an item category'],
      enum: [
        'Electronics',
        'Books & Stationery',
        'IDs & Cards',
        'Wallets & Bags',
        'Keys',
        'Clothing & Accessories',
        'Other'
      ]
    },
    reportType: {
      type: String,
      required: [true, 'Please specify if this item is lost or found'],
      enum: ['lost', 'found']
    },
    dateOfIncident: {
      type: Date,
      required: [true, 'Please provide the approximate date'],
      default: Date.now
    },
    campusLocation: {
      type: String,
      required: [true, 'Please specify the campus location'],
      enum: [
        'Central Library',
        'Main Cafeteria',
        'Auditorium',
        'Science Block / Labs',
        'Sports Complex',
        'Engineering Wing',
        'Hostel Block',
        'Campus Parking',
        'Administration Office',
        'Other'
      ]
    },
    locationDetails: {
      type: String,
      trim: true,
      maxlength: [200, 'Location details cannot exceed 200 characters'],
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    identifyingDetails: {
      type: String,
      trim: true,
      maxlength: [500, 'Identifying details cannot exceed 500 characters'],
      default: '',
      select: false // Private by default, only selected when explicitly needed by owner or admin
    },
    contactPreference: {
      type: String,
      enum: ['email', 'phone', 'handover_security', 'handover_admin'],
      default: 'email'
    },
    contactPhone: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claim_pending', 'resolved'],
      default: function () {
        return this.reportType === 'lost' ? 'lost' : 'found';
      }
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isModerated: {
      type: Boolean,
      default: false
    },
    moderationNote: {
      type: String,
      default: ''
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
itemSchema.index({ title: 'text', description: 'text', locationDetails: 'text' });
itemSchema.index({ reportType: 1, status: 1, category: 1, campusLocation: 1 });
itemSchema.index({ reporter: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
