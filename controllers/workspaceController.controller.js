const Workspace = require('../models/Workspace.model');

const createWorkspace = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const workspace = await Workspace.create({ name });

    return res.status(201).json({ workspace });
  } catch (err) {
    throw err;
  }
};

const getWorkspaces = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const workspaces = await Workspace.find().select('-updatedAt -__v');

    return res.status(200).json({ workspaces });
  } catch (err) {
    throw err;
  }
};

const modifyWorkspace = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    return res.status(200).json({ message: 'Workspaces updated' });
  } catch (err) {
    throw err;
  }
};

const deleteWorkspace = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Id is required' });
    }

    await Workspace.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Workspace deleted' });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createWorkspace,
  modifyWorkspace,
  deleteWorkspace,
  getWorkspaces,
};
