const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const client = require('./db/client');
require('dotenv').config();

const server = express();
const { PORT = 3000 } = process.env;
const { apiRouter } = require('./api/index');

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(morgan('dev'));
server.use('/api', apiRouter);

server.use((req, res, next) => {
	res.sendStatus(404);
});

server.use((error, req, res, next) => {
	console.log('Server Log', error);
	res.send(error);
});

server.listen(PORT, () => {
	client.connect();
	console.log(`Listening on port ${PORT}`);
});