// backend/models/GreenZone.js
import mongoose from 'mongoose';

/**
 * GreenZone Schema
 * Represents mapped urban green spaces with geolocation data
 */
const greenZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  coordinates: {
    type: Object,
    required: [true, 'Coordinates are required'],
    // GeoJSON format expected: { type: "Polygon", coordinates: [[lng, lat], ...] }
  },
  coverageLevel: {
    type: String,
    enum: {
      values: ['High', 'Medium', 'Low'],
      message: 'Coverage level must be High, Medium, or Low'
    },
    required: [true, 'Coverage level is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries (if needed in future)
greenZoneSchema.index({ coordinates: '2dsphere' });
greenZoneSchema.index({ verified: 1 });

const GreenZone = mongoose.model('GreenZone', greenZoneSchema);

export default GreenZone;