require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors');
const client = require('./db/client');


const  {apiRouter} = require('./api/index');

// Setup your Middleware and API Router here

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);

app.use((req, res, next) => {
    res.sendStatus(404);
});

app.use((error, req, res, next) => {
    console.log('Server Log', error);
    res.send(error);
});


module.exports = app;