const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer', 
    required: true 
  },
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ServiceProvider',
    required: true
  },
  service: { type: String, required: true },
  // FIXED: Only one status field with all possible values
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "in-progress",
      "customer-cancelled", 
    ],
    default: "pending",
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  completedAt: { type: Date },
  completedBy: { type: String },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  cancelledBy: { type: String },
}, {
  timestamps: true
});

serviceRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.ServiceRequest || 
  mongoose.model('ServiceRequest', serviceRequestSchema);