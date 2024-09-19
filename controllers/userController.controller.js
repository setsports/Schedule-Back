const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const fs = require('fs');
const path = require('path');
const { mongoose } = require('mongoose');

const createToken = async (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: '30d',
  });
};

const checkAuth = async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    return res.json(true);
  }

  return res.json(false);
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const time = new Date().getTime();

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(409).json({ message: 'Email is already used' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      picture: req.file && `users/${req.file.filename}`,
      role: role,
    });

    res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    throw error;
  }
};

const modifyUser = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById({ _id: req.user.id }).select(
      '-password -createdAt -updatedAt'
    );

    if (body) {
      Object.entries(body).map(async ([key, value]) => {
        user[key] = value;
      });

      if (req.file) {
        if (user.picture) {
          fs.unlinkSync(path.resolve(__dirname, `../uploads/${user.picture}`));
        }

        user['picture'] = req.file && `users/${req.file.filename}`;
      }

      await user.save();
    } else {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    res.status(200).json({ message: 'User has been modified' });
  } catch (err) {
    throw err;
  }
};

const modifySingleUser = async (req, res) => {
  const token = req.cookies.token;
  const body = req.body;
  const time = new Date().getTime();

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (body) {
      Object.entries(body).map(async ([key, value]) => {
        user[key] = value;
      });

      if (req.file) {
        if (user.picture) {
          fs.unlinkSync(path.resolve(__dirname, `../uploads/${user.picture}`));
        }

        user['picture'] = req.file && `users/${req.file.filename}`;
      } else if (req.body.email) {
        const newEmail = req.body.email;
        const foundUser = await User.findOne({ email: newEmail });

        if (foundUser) {
          return res.status(409).json({ message: 'Email is already used' });
        } else {
          user['email'] = newEmail;
        }
      }

      await user.save();
    } else {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    return res.status(200).json({ message: 'User has been modified' });
  } catch (err) {
    throw err;
  }
};

const deleteUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (id) {
      if (user.picture) {
        try {
          fs.unlinkSync(path.resolve(__dirname, `../uploads/${user.picture}`));
        } catch (err) {
          throw err;
        }
      }

      await User.findByIdAndDelete(new mongoose.Types.ObjectId(id));

      return res.status(200).json({ message: 'User has been deleted' });
    } else {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
  } catch (err) {
    throw err;
  }
};

const getUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById({ _id: req.user.id }).select(
      '-_id -password -createdAt -updatedAt'
    );

    res.status(200).json(user);
  } catch (err) {
    throw err;
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      const checkPassword = await bcrypt.compareSync(
        password,
        foundUser.password
      );

      if (checkPassword) {
        const token = await createToken(foundUser._id);
        res.cookie('token', token, {
          withCredentials: true,
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
        });

        return res.status(200).json({ message: 'Successfully logged in' });
      } else {
        return res.status(401).json({ message: 'Password is incorrect' });
      }
    } else {
      return res.status(422).json({ message: 'User not found' });
    }
  } catch (error) {
    throw error;
  }
};

const logoutUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ message: 'User successfully logged out' });
  } catch (err) {
    throw err;
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -updatedAt -__v');
    res.status(200).json({ users });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  checkAuth,
  createUser,
  authUser,
  getUser,
  logoutUser,
  getUsers,
  modifyUser,
  modifySingleUser,
  deleteUser,
};
