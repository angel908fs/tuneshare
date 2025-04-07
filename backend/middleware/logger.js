

const MiddlewareLog = require('../models/middleware.js');

const loggerMiddleware = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {

    const logEntry = new MiddlewareLog({

      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date(),
      referrer: req.get('Referrer') || null,
      origin: req.get('Origin') || null
    });

    try {
      await logEntry.save();
    } catch (err) {
      console.log('Logger middleware failed to save log:', err.message);
    }
  });

  next();
};

module.exports = loggerMiddleware;