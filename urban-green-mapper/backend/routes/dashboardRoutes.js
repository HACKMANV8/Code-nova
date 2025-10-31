// backend/routes/dashboardRoutes.js
import express from 'express';
import GreenZone from '../models/GreenZone.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Verification from '../models/Verification.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard statistics and metrics
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all required metrics in parallel for better performance
    const [
      totalTrees,
      totalCommunities,
      verifiedZones,
      totalUsers,
      totalVerifications,
      recentZones
    ] = await Promise.all([
      GreenZone.countDocuments(),
      Community.countDocuments(),
      GreenZone.countDocuments({ verified: true }),
      User.countDocuments(),
      Verification.countDocuments(),
      GreenZone.find().sort({ createdAt: -1 }).limit(5).select('name coverageLevel verified createdAt')
    ]);

    // Calculate CO2 offset (assuming 22 kg/year per tree/zone)
    const co2Offset = totalTrees * 22;

    // Calculate coverage statistics
    const coverageStats = await GreenZone.aggregate([
      {
        $group: {
          _id: '$coverageLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format coverage stats
    const coverageByLevel = {
      High: 0,
      Medium: 0,
      Low: 0
    };
    coverageStats.forEach(stat => {
      if (stat._id) {
        coverageByLevel[stat._id] = stat.count;
      }
    });

    // Calculate verification rate
    const verificationRate = totalTrees > 0 
      ? ((verifiedZones / totalTrees) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalTrees,
          totalCommunities,
          verifiedZones,
          totalUsers,
          co2Offset: `${co2Offset} kg/year`,
          verificationRate: `${verificationRate}%`
        },
        coverage: {
          byLevel: coverageByLevel,
          total: totalTrees
        },
        engagement: {
          totalVerifications,
          communitiesActive: totalCommunities,
          usersActive: totalUsers
        },
        recentActivity: recentZones.map(zone => ({
          id: zone._id,
          name: zone.name,
          coverageLevel: zone.coverageLevel,
          verified: zone.verified,
          addedAt: zone.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get detailed statistics for analytics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Get zones grouped by month
    const zonesByMonth = await GreenZone.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 } // Last 12 months
    ]);

    // Get top communities by zone count
    const topCommunities = await Community.aggregate([
      {
        $project: {
          name: 1,
          zoneCount: { $size: '$zones' },
          memberCount: { $size: '$members' }
        }
      },
      { $sort: { zoneCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        growthTrend: zonesByMonth.map(item => ({
          period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          zonesAdded: item.count
        })),
        topCommunities: topCommunities.map(c => ({
          name: c.name,
          zones: c.zoneCount,
          members: c.memberCount
        }))
      }
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

export default router;