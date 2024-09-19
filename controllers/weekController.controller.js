const Week = require('../models/Week.model');

const setWeek = async (req, res) => {
  const token = req.cookies.token;
  const { start, end } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!start || !end) {
    return res.status(400).json({ message: 'No week start or end provided' });
  }

  try {
    Week.collection.drop();

    const week = new Week({
      start,
      end,
    });

    await week.save();

    return res.status(200).json({ message: 'Week set successfully' });
  } catch (err) {
    throw err;
  }
};

const getWeek = async (req, res) => {
  try {
    const week = await Week.find();

    return res.status(200).json({ week: week[0] });
  } catch (err) {
    throw err;
  }
};

module.exports = { setWeek, getWeek };
