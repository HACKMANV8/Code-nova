// backend/routes/greenZoneRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import GreenZone from '../models/GreenZone.js';
import Verification from '../models/Verification.js';
import Community from '../models/Community.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'verification-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
});

/**
 * @route   POST /api/greenzones
 * @desc    Add a new green zone
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, coordinates, coverageLevel, communityId } = req.body;

    // Validate input
    if (!name || !coordinates || !coverageLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, coordinates, and coverageLevel'
      });
    }

    // Validate coverageLevel
    if (!['High', 'Medium', 'Low'].includes(coverageLevel)) {
      return res.status(400).json({
        success: false,
        message: 'coverageLevel must be High, Medium, or Low'
      });
    }

    // Create green zone
    const greenZone = await GreenZone.create({
      name,
      coordinates,
      coverageLevel,
      community: communityId || null,
      createdBy: req.user._id
    });

    // If communityId provided, add zone to community
    if (communityId) {
      await Community.findByIdAndUpdate(
        communityId,
        { $push: { zones: greenZone._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Green zone added successfully',
      greenZone: {
        id: greenZone._id,
        name: greenZone.name,
        coordinates: greenZone.coordinates,
        coverageLevel: greenZone.coverageLevel,
        verified: greenZone.verified
      }
    });
  } catch (error) {
    console.error('Create green zone error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating green zone'
    });
  }
});

/**
 * @route   GET /api/greenzones
 * @desc    Get all green zones
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { verified, coverageLevel } = req.query;
    
    // Build query filter
    const filter = {};
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
    if (coverageLevel) {
      filter.coverageLevel = coverageLevel;
    }

    const greenZones = await GreenZone.find(filter)
      .populate('createdBy', 'name email')
      .populate('community', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: greenZones.length,
      greenZones: greenZones.map(zone => ({
        id: zone._id,
        name: zone.name,
        coordinates: zone.coordinates,
        coverageLevel: zone.coverageLevel,
        verified: zone.verified,
        community: zone.community,
        createdBy: zone.createdBy,
        createdAt: zone.createdAt
      }))
    });
  } catch (error) {
    console.error('Get green zones error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching green zones'
    });
  }
});

/**
 * @route   POST /api/verify-planting
 * @desc    Verify a planting with image upload
 * @access  Private (requires authentication)
 */
router.post('/verify-planting', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { zoneId, notes } = req.body;

    // Validate input
    if (!zoneId) {
      return res.status(400).json({
        success: false,
        message: 'Zone ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Check if zone exists
    const zone = await GreenZone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Green zone not found'
      });
    }

    // Create verification record
    const imageUrl = `/uploads/${req.file.filename}`;
    const verification = await Verification.create({
      zoneId,
      imageUrl,
      verifiedBy: req.user._id,
      notes: notes || ''
    });

    // Mark zone as verified
    zone.verified = true;
    await zone.save();

    res.status(201).json({
      success: true,
      message: 'Planting verified successfully',
      verification: {
        id: verification._id,
        zoneId: verification.zoneId,
        imageUrl: verification.imageUrl,
        verifiedBy: verification.verifiedBy,
        verifiedAt: verification.verifiedAt
      },
      zone: {
        id: zone._id,
        name: zone.name,
        verified: zone.verified
      }
    });
  } catch (error) {
    console.error('Verify planting error:', error.message);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid zone ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while verifying planting'
    });
  }
});

export default router;