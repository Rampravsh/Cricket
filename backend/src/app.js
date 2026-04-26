const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sendResponse } = require('./utils/response');

const app = express();

// --- Security Middleware ---
// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: sendResponse(false, 'Too many requests from this IP, please try again later.'),
});
app.use('/api', limiter);

// --- Body Parsers & Sanitization ---
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection (Express 5 compatibility fix)
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

// --- Logging ---
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/v1', routes);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json(sendResponse(false, `Can't find ${req.originalUrl} on this server!`));
});

// --- Global Error Handler ---
app.use(errorHandler);

module.exports = app;
