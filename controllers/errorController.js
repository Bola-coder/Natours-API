const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateValueErrorDB = (err) => {
  // const dupValue = Object.keys(err.keyValue)[0];
  // console.log(dupValue);
  const message = `Field exists.`;
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
  // Operational / Trusted  : Send error message to cleint
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown errors: Send generic error mesage
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

  // Error in development mode
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  // Error in production mode
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // console.log('An error occurred', err);
    if ((error.code = 11000)) {
      error = handleDuplicateValueErrorDB(error);
    }
    if ((error.name = 'CastError')) {
      error = handleCastErrorDB(error);
    }
    sendErrorProd(error, res);
  }
  next();
};
