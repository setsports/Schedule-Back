const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    utcDate: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    gmt: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    channel: {
      type: [mongoose.Types.ObjectId],
      ref: 'Channel',
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    workspace: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
