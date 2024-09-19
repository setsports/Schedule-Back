const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    relation: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Workspace',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
