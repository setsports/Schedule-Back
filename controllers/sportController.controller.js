const Sport = require('../models/Sport.model');

const createSport = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name, platforms } = req.body;

    if (!name || platforms.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const sport = new Sport({
      name,
      relation: platforms.map((platform) => platform.value),
    });

    await sport.save();

    return res.status(201).json({ message: 'Sport has been created' });
  } catch (err) {
    throw err;
  }
};

const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().select('-updatedAt -__v');

    return res.status(200).json({ sports });
  } catch (err) {
    throw err;
  }
};

const modifySport = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body.data;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }

    if (body.relation) {
      sport.relation = body.relation.map((relation) => relation.value);
    } else {
      Object.entries(body).forEach(([key, value]) => {
        if (key !== 'relation') {
          sport[key] = value;
        }
      });
    }

    await sport.save();

    return res.status(200).json({ message: 'Sport has been modified' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteSport = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Id is required' });
    }

    await Sport.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Sport deleted' });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createSport,
  modifySport,
  deleteSport,
  getSports,
};
