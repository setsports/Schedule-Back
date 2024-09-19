const mongoose = require('mongoose');

const weekScheme = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Week = mongoose.model('Week', weekScheme);

module.exports = Week;
