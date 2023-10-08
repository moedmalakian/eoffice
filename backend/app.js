const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

//EMPLOYEE
const employeeRoutes = require('./routes/employee');
//DIVISION
const divisionRoutes = require('./routes/division');
//POSITION
const positionRoutes = require('./routes/position');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//EMPLOYEE
app.use('/employee', employeeRoutes);
//DIVISION
app.use('/division', divisionRoutes);
//POSITION
app.use('/position', positionRoutes);

app.use((req, res, next) => {
    const error = new Error('Data Not Found!');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ 
        error: {
            message: error.message
        }
    })
})

module.exports = app;