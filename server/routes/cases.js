const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Case = require('../models/Case');
const { auth, allowRoles } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, department, location, severity, isAnonymous } = req.body;
    const caseData = {
      title, description, category, department, location, severity,
      isAnonymous: isAnonymous === 'true',
      submittedBy: isAnonymous === 'true' ? null : req.user.id,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    const newCase = new Case(caseData);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mycases', auth, allowRoles('case_manager'), async (req, res) => {
  try {
    const cases = await Case.find({ assignedTo: req.user.id })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/track/:trackingId', async (req, res) => {
  try {
    const found = await Case.findOne({ trackingId: req.params.trackingId })
      .populate('assignedTo', 'name');
    if (!found) return res.status(404).json({ message: 'Case not found' });
    res.json({
      trackingId: found.trackingId,
      status: found.status,
      category: found.category,
      department: found.department,
      severity: found.severity,
      assignedTo: found.assignedTo?.name || 'Not assigned yet',
      createdAt: found.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const found = await Case.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name');
    if (!found) return res.status(404).json({ message: 'Case not found' });
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/assign', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo, status: 'Assigned', assignedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', auth, allowRoles('case_manager', 'secretariat', 'admin'), async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/notes', auth, allowRoles('case_manager', 'secretariat', 'admin'), async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    found.notes.push({ text: req.body.text, addedBy: req.user.id });
    await found.save();
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;