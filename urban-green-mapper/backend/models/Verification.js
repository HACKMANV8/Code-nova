// backend/models/Verification.js
import mongoose from 'mongoose';

/**
 * Verification Schema
 * Tracks planting verifications with photographic evidence
 */
const verificationSchema = new mongoose.Schema({
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GreenZone',
    required: [true, 'Zone ID is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Verifier user ID is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient verification lookups
verificationSchema.index({ zoneId: 1 });
verificationSchema.index({ verifiedBy: 1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;