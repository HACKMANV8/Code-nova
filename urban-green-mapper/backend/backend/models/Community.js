// backend/models/Community.js
import mongoose from 'mongoose';

/**
 * Community Schema
 * Represents collaborative groups mapping urban green spaces
 */
const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  zones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GreenZone'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient community queries
communitySchema.index({ name: 1 });
communitySchema.index({ createdBy: 1 });

const Community = mongoose.model('Community', communitySchema);

export default Community;