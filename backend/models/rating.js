const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now }
});
ratingSchema.index({ serviceProviderId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);