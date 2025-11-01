// backend/routes/aiRoutes.js
import express from 'express';

const router = express.Router();

/**
 * Generate random GeoJSON polygon coordinates
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radius - Radius in degrees (approximate)
 * @returns {Array} Array of [lng, lat] coordinates
 */
const generateRandomPolygon = (centerLat, centerLng, radius = 0.001) => {
  const points = 5; // Pentagon shape
  const coordinates = [];
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const randomRadius = radius * (0.8 + Math.random() * 0.4); // Add variance
    const lat = centerLat + randomRadius * Math.cos(angle);
    const lng = centerLng + randomRadius * Math.sin(angle);
    coordinates.push([lng, lat]);
  }
  
  // Close the polygon by adding first point at end
  coordinates.push(coordinates[0]);
  
  return coordinates;
};

/**
 * @route   POST /api/detect-trees
 * @desc    Simulate AI tree detection (mock)
 * @access  Public
 */
router.post('/detect-trees', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;

    // Use provided coordinates or default to sample location
    const centerLat = latitude || 12.9716; // Bangalore, India
    const centerLng = longitude || 77.5946;
    const searchRadius = radius || 0.005;

    // Generate 3-5 random detected zones
    const zoneCount = 3 + Math.floor(Math.random() * 3); // 3 to 5 zones
    const coverageLevels = ['High', 'Medium', 'Low'];
    const detectedZones = [];

    for (let i = 0; i < zoneCount; i++) {
      // Random offset from center
      const offsetLat = centerLat + (Math.random() - 0.5) * searchRadius;
      const offsetLng = centerLng + (Math.random() - 0.5) * searchRadius;
      
      const zone = {
        type: 'Polygon',
        coordinates: [generateRandomPolygon(offsetLat, offsetLng)],
        coverageLevel: coverageLevels[Math.floor(Math.random() * coverageLevels.length)],
        confidence: (0.7 + Math.random() * 0.3).toFixed(2), // 0.70 to 1.00
        estimatedTreeCount: Math.floor(10 + Math.random() * 90) // 10 to 100 trees
      };
      
      detectedZones.push(zone);
    }

    console.log(`🤖 AI Detection: Generated ${zoneCount} mock zones`);

    res.status(200).json({
      success: true,
      message: 'AI tree detection completed (simulated)',
      detectedZones,
      metadata: {
        centerLocation: { latitude: centerLat, longitude: centerLng },
        searchRadius,
        zonesDetected: zoneCount,
        processingTime: `${(Math.random() * 2 + 1).toFixed(2)}s`,
        mockSimulation: true
      }
    });
  } catch (error) {
    console.error('AI detection error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during AI detection'
    });
  }
});

/**
 * @route   GET /api/detect-trees/status
 * @desc    Get AI detection service status
 * @access  Public
 */
router.get('/detect-trees/status', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'AI Tree Detection',
    status: 'online',
    mode: 'simulation',
    version: '1.0.0',
    capabilities: [
      'Polygon generation',
      'Coverage level estimation',
      'Multi-zone detection'
    ]
  });
});

export default router;