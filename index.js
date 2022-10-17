const express = require('express');
const security = require('helmet');
const logger = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');
require('dotenv').config();
require('colors');
const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(logger('tiny'));
app.use(security());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./routes/userRoutes'));

app.use(errorHandler);

app.listen(port, () => console.log(`> Server is running on port : ${port}`));
