const fs = require('fs');
const path = require('path');
const Country = require('../models/Country.model');
const Channel = require('../models/Channel.model');

const createChannel = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name } = req.body;
    const countries = JSON.parse(req.body.countries);

    if (!name || countries.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const ids = [];
    for (const country of countries) {
      const foundCountry = await Country.findOne({ name: country.label });
      if (foundCountry !== null) {
        ids.push(foundCountry.id);
      }
    }

    const channel = new Channel({
      name,
      picture: req.file && `channels/${req.file.filename}`,
      relation: ids,
    });

    await channel.save();

    return res.status(200).json({ message: 'Channel has been created' });
  } catch (err) {
    throw err;
  }
};

const modifyChannel = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const channel = await Channel.findById(req.params.id);

    if (!Channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (body.relation) {
      const ids = [];
      const relations = JSON.parse(body.relation);

      await Promise.all(
        relations.map(async (country) => {
          const foundCountry = await Country.findOne({
            name: country.label,
          });
          if (foundCountry !== null) {
            ids.push(foundCountry.id);
          }
        })
      );

      channel.relation = ids;
    }

    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'relation') {
        channel[key] = value;
      }
    });

    if (req.file) {
      if (channel.picture) {
        try {
          fs.unlinkSync(
            path.resolve(__dirname, `../uploads/${channel.picture}`)
          );
        } catch (err) {
          throw err;
        }
      }
      channel.picture = `channels/${req.file.filename}`;
    }

    await channel.save();

    return res.status(200).json({ message: 'Channel has been modified' });
  } catch (err) {
    throw err;
  }
};

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find()
      .select('-updatedAt -__v')
      .populate('relation')
      .select('--updatedAt');

    return res.status(200).json({ channels });
  } catch (err) {
    throw err;
  }
};

const getClientChannels = async (req, res) => {
  const country = req.body.country;

  try {
    const channels = await Channel.find()
      .select('-updatedAt -__v -_id -createdAt')
      .populate({
        path: 'relation',
        match: country && { name: country },
        select: '-_id -__v -createdAt -updatedAt',
      });

    const filteredChannels = channels.filter(
      (channel) => channel.relation.length !== 0
    );

    return res.status(200).json({ channels: filteredChannels });
  } catch (err) {
    throw err;
  }
};

const deleteChannel = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const channel = await Channel.findById(req.params.id);

    if (channel.picture) {
      try {
        fs.unlinkSync(path.resolve(__dirname, `../uploads/${channel.picture}`));
      } catch (err) {
        throw err;
      }
    }

    await Channel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Channel has been deleted' });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createChannel,
  getChannels,
  getClientChannels,
  modifyChannel,
  deleteChannel,
};
