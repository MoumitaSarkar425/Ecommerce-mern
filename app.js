const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const errorMiddleware = require('./middleware/error');
app.use(express.json());
app.use(cookieParser());
// import routes

const products = require('./routes/productRoute')
app.use('/api/v1',products)


const user = require('./routes/userRoutes')
app.use('/api/v1',user)


const order = require('./routes/orderRoute')
app.use('/api/v1',order)

// middleware for error 
app.use(errorMiddleware);


module.exports = app