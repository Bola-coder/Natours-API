// Global Error handling Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = res.statusCode || 500; // 500 is internal server error
  err.status = err.status || 'error'; // error is the status for 500 codes
  res.status(err.statusCode).json({
    status: err.status,
    messgae: err.message,
  });
  next();
};
