const Item = require('../models/Item');
const User = require('../models/User');
const Claim = require('../models/Claim');

// @desc    Get dashboard analytics & statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments();
    const activeLost = await Item.countDocuments({ reportType: 'lost', status: 'lost' });
    const activeFound = await Item.countDocuments({ reportType: 'found', status: { $in: ['found', 'claim_pending'] } });
    const resolvedItems = await Item.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const approvedClaims = await Claim.countDocuments({ status: { $in: ['approved', 'completed'] } });

    // Category breakdown
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Location breakdown
    const locationStats = await Item.aggregate([
      { $group: { _id: '$campusLocation', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recovery rate percentage
    const recoveryRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalItems,
        activeLost,
        activeFound,
        resolvedItems,
        recoveryRate,
        totalUsers,
        totalClaims,
        pendingClaims,
        approvedClaims,
        categoryStats,
        locationStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items for admin with moderation flags
// @route   GET /api/admin/items
// @access  Private (Admin)
const getAdminItems = async (req, res, next) => {
  try {
    const { search, reportType, status, isModerated, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { campusLocation: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (reportType && ['lost', 'found'].includes(reportType)) {
      query.reportType = reportType;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (isModerated !== undefined && isModerated !== 'All') {
      query.isModerated = isModerated === 'true';
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('reporter', 'name email department role phone')
      .select('+identifyingDetails')
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

// @desc    Moderate an item (flag as inappropriate, add moderation notes, or toggle visibility)
// @route   PATCH /api/admin/items/:id/moderate
// @access  Private (Admin)
const moderateItem = async (req, res, next) => {
  try {
    const { isModerated, moderationNote, status } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    if (isModerated !== undefined) {
      item.isModerated = Boolean(isModerated);
    }
    if (moderationNote !== undefined) {
      item.moderationNote = moderationNote.trim();
    }
    if (status) {
      item.status = status;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item moderation status updated.',
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin deletion of an item
// @route   DELETE /api/admin/items/:id
// @access  Private (Admin)
const deleteAdminItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    await Claim.deleteMany({ item: item._id });
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item and related records permanently removed by Administrator.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    // Attach count of items reported per user
    const userStats = await Item.aggregate([
      { $group: { _id: '$reporter', count: { $sum: 1 } } }
    ]);
    const reportCountMap = {};
    userStats.forEach((us) => {
      if (us._id) {
        reportCountMap[us._id.toString()] = us.count;
      }
    });

    const usersWithStats = users.map((u) => ({
      ...u,
      reportsCount: reportCountMap[u._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminItems,
  moderateItem,
  deleteAdminItem,
  getAdminUsers
};
