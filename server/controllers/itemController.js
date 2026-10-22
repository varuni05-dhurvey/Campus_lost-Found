const Item = require('../models/Item');
const Claim = require('../models/Claim');
const fs = require('fs');
const path = require('path');

// @desc    Get all items with search, filters, pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const {
      search,
      reportType,
      category,
      campusLocation,
      status,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isArchived: { $ne: true } };

    // Search query across title and description
    if (search && search.trim() !== '') {
      const cleanSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { locationDetails: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    // Filter by report type (lost or found)
    if (reportType && ['lost', 'found'].includes(reportType.toLowerCase())) {
      query.reportType = reportType.toLowerCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by campus location
    if (campusLocation && campusLocation !== 'All') {
      query.campusLocation = campusLocation;
    }

    // Filter by status (lost, found, claim_pending, resolved)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'incidentDate') {
      sortOptions = { dateOfIncident: -1 };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .populate('reporter', 'name email department role')
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
      items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public (with optional user context)
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reporter', 'name email department role phone')
      .select('+identifyingDetails');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const isOwner = req.user && req.user._id.toString() === item.reporter._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // If not owner or admin, do not expose the private identifyingDetails
    const itemObject = item.toObject();
    if (!isOwner && !isAdmin) {
      delete itemObject.identifyingDetails;
    }

    // Check if the current user has an existing claim for this item
    let userClaim = null;
    if (req.user && !isOwner) {
      userClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      item: itemObject,
      isOwner,
      userClaim
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lost or found report
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      reportType,
      dateOfIncident,
      campusLocation,
      locationDetails,
      identifyingDetails,
      contactPreference,
      contactPhone
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !reportType || !campusLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, report type, and campus location.'
      });
    }

    // Safe handling of uploaded image if present
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // In case image URL is supplied directly
      imageUrl = req.body.imageUrl.trim();
    }

    const newItem = await Item.create({
      title: title.trim(),
      description: description.trim(),
      category,
      reportType,
      dateOfIncident: dateOfIncident ? new Date(dateOfIncident) : new Date(),
      campusLocation,
      locationDetails: locationDetails ? locationDetails.trim() : '',
      imageUrl,
      identifyingDetails: identifyingDetails ? identifyingDetails.trim() : '',
      contactPreference: contactPreference || 'email',
      contactPhone: contactPhone ? contactPhone.trim() : '',
      status: reportType === 'lost' ? 'lost' : 'found',
      reporter: req.user._id
    });

    const populatedItem = await Item.findById(newItem._id).populate(
      'reporter',
      'name email department role'
    );

    res.status(201).json({
      success: true,
      message: `${reportType === 'lost' ? 'Lost' : 'Found'} item reported successfully!`,
      item: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item report
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this item report.'
      });
    }

    const {
      title,
      description,
      category,
      campusLocation,
      locationDetails,
      identifyingDetails,
      contactPreference,
      contactPhone,
      status
    } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (campusLocation) item.campusLocation = campusLocation;
    if (locationDetails !== undefined) item.locationDetails = locationDetails.trim();
    if (identifyingDetails !== undefined) item.identifyingDetails = identifyingDetails.trim();
    if (contactPreference) item.contactPreference = contactPreference;
    if (contactPhone !== undefined) item.contactPhone = contactPhone.trim();
    if (status) item.status = status;

    // Handle new uploaded image if provided
    if (req.file) {
      // Delete old local file if existed
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', item.imageUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, () => {});
        }
      }
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    const updatedItem = await Item.findById(item._id).populate(
      'reporter',
      'name email department role'
    );

    res.status(200).json({
      success: true,
      message: 'Item report updated successfully.',
      item: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item report
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this item report.'
      });
    }

    // Clean up uploaded image if exists
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    // Delete related claims
    await Claim.deleteMany({ item: item._id });

    // Delete item
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item report and related claims deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get items reported by current logged-in user
// @route   GET /api/items/mine
// @access  Private
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .select('+identifyingDetails')
      .lean();

    // Attach count of pending claims for each item
    const itemIds = items.map((i) => i._id);
    const pendingClaims = await Claim.aggregate([
      { $match: { item: { $in: itemIds }, status: 'pending' } },
      { $group: { _id: '$item', count: { $sum: 1 } } }
    ]);

    const claimCountMap = {};
    pendingClaims.forEach((pc) => {
      claimCountMap[pc._id.toString()] = pc.count;
    });

    const itemsWithClaims = items.map((item) => ({
      ...item,
      pendingClaimsCount: claimCountMap[item._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: itemsWithClaims.length,
      items: itemsWithClaims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick status change (e.g. mark as resolved / recovered)
// @route   PATCH /api/items/:id/status
// @access  Private (Owner or Admin)
const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['lost', 'found', 'claim_pending', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.'
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    const isOwner = item.reporter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to change the status of this item.'
      });
    }

    item.status = status;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Item marked as ${status === 'resolved' ? 'Resolved / Recovered' : status}.`,
      item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  updateItemStatus
};
