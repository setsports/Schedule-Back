const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
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
      ref: 'Country',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
