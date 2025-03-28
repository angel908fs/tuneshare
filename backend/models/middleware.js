const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');  

const MiddlewareLogSchema = new mongoose.Schema({
  log_id:{type: String, default: uuidv4},
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  userAgent: { type: String },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String },
  origin: { type: String }
});

const MiddlewareLog = mongoose.model('MiddlewareLog', MiddlewareLogSchema);
module.exports = MiddlewareLog;