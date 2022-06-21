const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); // A middleware (will be explained later) that allows us to modify the request body
app.use(express.static(`${__dirname}/public`)); // Used to serve static files

// Another custom middleware that modifies the request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const error = new AppError(
    `cant find ${req.originalUrl} on this server`,
    404
  );
  next(error);
});

app.use(globalErrorHandler);
module.exports = app;
