const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connectDB');
require('dotenv').config();
require('colors');

global._basedir = __dirname;

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URI,
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRoutes = require('./routes/userRoutes.route');
const sportRoutes = require('./routes/sportRoutes.route');
const workspaceRoutes = require('./routes/workspaceRoutes.route');
const countryRoutes = require('./routes/countryRoutes.route');
const channelRoutes = require('./routes/channelRoutes.route');
const gameRoutes = require('./routes/gameRoutes.route');
const weekRoutes = require('./routes/weekRoutes.route');

app.use('/api/user', userRoutes);
app.use('/api/sport', sportRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/country', countryRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/week', weekRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server has started on port: ${PORT}`.yellow);
  }
});
