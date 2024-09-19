const fs = require('fs');
const path = require('path');
const Country = require('../models/Country.model');
const Workspace = require('../models/Workspace.model');
const AppCountry = require('../models/AppCountry.model');

const createCountry = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name } = req.body;
    const workspaces = JSON.parse(req.body.workspaces);

    if (!name || workspaces.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const ids = [];
    for (const workspace of workspaces) {
      const foundWorkspace = await Workspace.findOne({ name: workspace.label });
      if (foundWorkspace !== null) {
        ids.push(foundWorkspace.id);
      }
    }

    const country = new Country({
      name,
      picture: req.file && `countries/${req.file.filename}`,
      relation: ids,
    });

    await country.save();

    return res.status(201).json({ message: 'Country has been created' });
  } catch (err) {
    throw err;
  }
};

const createAppCountry = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name, gmt } = req.body;

    if (!name || !gmt) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const country = new AppCountry({
      name,
      gmt,
      picture: req.file && `countries/${req.file.filename}`,
    });

    await country.save();

    return res.status(201).json({ message: 'Country has been created' });
  } catch (err) {
    throw err;
  }
};

const modifyCountry = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const country =
      (await Country.findById(req.params.id)) ||
      (await AppCountry.findById(req.params.id));

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    if (body.relation) {
      const ids = [];
      const relations = JSON.parse(body.relation);

      await Promise.all(
        relations.map(async (workspace) => {
          const foundWorkspace = await Workspace.findOne({
            name: workspace.label,
          });
          if (foundWorkspace !== null) {
            ids.push(foundWorkspace.id);
          }
        })
      );

      country.relation = ids;
    }

    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'relation') {
        country[key] = value;
      }
    });

    if (req.file) {
      if (country.picture) {
        try {
          fs.unlinkSync(
            path.resolve(__dirname, `../uploads/${country.picture}`)
          );
        } catch (err) {
          throw err;
        }
      }
      country.picture = `countries/${req.file.filename}`;
    }

    await country.save();

    return res.status(200).json({ message: 'Country has been modified' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const modifyAppCountry = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const country = await AppCountry.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }

    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'relation') {
        country[key] = value;
      }
    });

    if (req.file) {
      if (country.picture) {
        try {
          fs.unlinkSync(
            path.resolve(__dirname, `../uploads/${country.picture}`)
          );
        } catch (err) {
          throw err;
        }
      }
      country.picture = `countries/${req.file.filename}`;
    }

    await country.save();

    return res.status(200).json({ message: 'Country has been modified' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getCountries = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const countries = await Country.find().select('-updatedAt -__v').populate({
      path: 'relation',
      select: '-_id -__v -createdAt -updatedAt',
    });

    const filteredCountries = countries.filter(
      (country) => country.relation.length !== 0
    );

    return res.status(200).json({ countries: filteredCountries });
  } catch (err) {
    throw err;
  }
};

const getAppCountries = async (req, res) => {
  try {
    const countries = await AppCountry.find().select('-updatedAt -__v');

    return res.status(200).json({ countries });
  } catch (err) {
    throw err;
  }
};

const getClientCountries = async (req, res) => {
  const language = req.body.language;

  try {
    const countries = await Country.find()
      .select('-updatedAt -__v -_id -createdAt')
      .populate({
        path: 'relation',
        match: { name: language },
        select: '-_id -__v -createdAt -updatedAt',
      });

    const filteredCountries = countries.filter(
      (country) => country.relation.length !== 0
    );

    return res.status(200).json({ countries: filteredCountries });
  } catch (err) {
    throw err;
  }
};

const deleteCountry = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const country = await Country.findById(req.params.id);

    if (country.picture) {
      try {
        fs.unlinkSync(path.resolve(__dirname, `../uploads/${country.picture}`));
      } catch (err) {
        throw err;
      }
    }

    await Country.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Country has been deleted' });
  } catch (err) {
    throw err;
  }
};

const deleteAppCountry = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const country = await AppCountry.findById(req.params.id);

    if (country.picture) {
      try {
        fs.unlinkSync(path.resolve(__dirname, `../uploads/${country.picture}`));
      } catch (err) {
        throw err;
      }
    }

    await AppCountry.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'App country has been deleted' });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getCountries,
  getAppCountries,
  getClientCountries,
  createCountry,
  createAppCountry,
  modifyCountry,
  modifyAppCountry,
  deleteCountry,
  deleteAppCountry,
};
