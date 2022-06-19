const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateValueErrorDB = (err) => {
  const dupValue = Object.keys(err.keyValue)[0];
  console.log(dupValue);
  const message = `exists. `;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational / Trusted errors
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown errors
  else {
    // Log the error to the console
    console.error('ERROR ', err);

    // Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

// Global Error handling Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 is internal server error
  err.status = err.status || 'error'; // error is the status for 500 codes
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if ((error.name = 'CastError')) error = handleCastErrorDB(error);
    if ((error.code = 11000)) error = handleDuplicateValueErrorDB(error);
    sendErrorProd(error, res);
  }
  next();
};
