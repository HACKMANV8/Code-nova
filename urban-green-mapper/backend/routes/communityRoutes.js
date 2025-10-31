// backend/routes/communityRoutes.js
import express from 'express';
import Community from '../models/Community.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/community
 * @desc    Create a new community
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide community name and description'
      });
    }

    // Create community with creator as first member
    const community = await Community.create({
      name,
      description,
      members: [req.user._id],
      createdBy: req.user._id
    });

    // Add community to user's communities array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { communities: community._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community: {
        id: community._id,
        name: community.name,
        description: community.description,
        memberCount: community.members.length
      }
    });
  } catch (error) {
    console.error('Create community error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating community'
    });
  }
});

/**
 * @route   GET /api/community/:id
 * @desc    Get community details with members and zones
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find community and populate members and zones
    const community = await Community.findById(id)
      .populate('members', 'name email')
      .populate('zones', 'name coordinates coverageLevel verified');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    res.status(200).json({
      success: true,
      community: {
        id: community._id,
        name: community.name,
        description: community.description,
        members: community.members,
        zones: community.zones,
        memberCount: community.members.length,
        zoneCount: community.zones.length,
        createdAt: community.createdAt
      }
    });
  } catch (error) {
    console.error('Get community error:', error.message);
    
    // Handle invalid MongoDB ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid community ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching community'
    });
  }
});

/**
 * @route   GET /api/community
 * @desc    Get all communities
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      communities: communities.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        memberCount: c.members.length,
        zoneCount: c.zones.length,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('Get communities error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching communities'
    });
  }
});

export default router;