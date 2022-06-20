const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception!! Shutting down');
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log('DB Connected Succesfully');
  })
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

/// Handling Unhandles rejected promises
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection!! Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
