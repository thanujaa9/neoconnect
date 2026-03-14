const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Case = require('../models/Case');
const Minutes = require('../models/Minutes');
const { auth, allowRoles } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'neoconnect-minutes',
    allowed_formats: ['pdf'],
    resource_type: 'auto',
    access_mode: 'public',
  },
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
      fileUrl: req.file.path,
      uploadedBy: req.user.id
    });
    await minutes.save();
    res.status(201).json(minutes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;