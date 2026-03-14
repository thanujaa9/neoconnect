const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Case = require('../models/Case');
const Minutes = require('../models/Minutes');
const { auth, allowRoles } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/digest', async (req, res) => {
  try {
    const resolved = await Case.find({ status: 'Resolved' })
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/impact', async (req, res) => {
  try {
    const resolved = await Case.find({
      status: 'Resolved',
      'resolution.summary': { $exists: true, $ne: '' }
    }).sort({ updatedAt: -1 }).limit(20);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/minutes', async (req, res) => {
  try {
    const minutes = await Minutes.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(minutes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/minutes', auth, allowRoles('secretariat', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File required' });
    const minutes = new Minutes({
      title: req.body.title,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });
    await minutes.save();
    res.status(201).json(minutes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;