const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MiddlewareLogSchema = new mongoose.Schema({
  log_id: { type: String, default: uuidv4 },
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  userAgent: { type: String },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String },
  origin: { type: String }
});

// Logs expire automatically after 30 days
MiddlewareLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60*60*24*30});

const MiddlewareLog = mongoose.model('MiddlewareLog', MiddlewareLogSchema);
module.exports = MiddlewareLog;
