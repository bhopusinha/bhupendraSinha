const express = require('express');
const app = express();
const dotenv=require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
const errorHandler = require('./middleware/error');



// if (process.env.NODE_ENV !== "PRODUCTION") {
//     require('dotenv').config({ path: 'backend/config/config.env' });
// }
dotenv.config({ path: 'config/config.env' });


app.get('/', (req, res) => {
  res.send('Hello from the root route!');
});
// routers
const product = require('./routes/productRoutes');
const user = require('./routes/userRoutes');
const order = require('./routes/orderRoutes');
const payment = require('./routes/paymentRoutes');

app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use(errorHandler);


module.exports = app;
