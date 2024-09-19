const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gmt: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AppCountry = mongoose.model('AppCountry', countrySchema);

module.exports = AppCountry;
