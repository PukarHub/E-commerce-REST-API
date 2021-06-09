const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

// Connect Database
connectDB(); 

const PORT = process.env.PORT || 5000;

const api = process.env.API_URL 

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(errorHandler);

// Routes
app.use(`${api}/categories`, require('./routes/categories'));
app.use(`${api}/orders`, require('./routes/orders'));
app.use(`${api}/products`, require('./routes/products'));
app.use(`${api}/users`, require('./routes/users'));


app.listen(PORT, console.log(`Server is running on port ${PORT}`));