const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    league: {
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
    eventId: {
      type: String,
      required: true,
    },
    countries: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AppGame = mongoose.model('AppGame', gameSchema);

module.exports = AppGame;
