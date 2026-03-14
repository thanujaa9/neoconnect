const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Case = require('../models/Case');
const { auth, allowRoles } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'neoconnect',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
    access_mode: 'public',
  },
});
const upload = multer({ storage });

const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) req.file = null;
    next();
  });
};

router.post('/', auth, uploadMiddleware, async (req, res) => {
  try {
    const { title, description, category, department, location, severity, isAnonymous } = req.body;
    const caseData = {
      title, description, category, department, location, severity,
      isAnonymous: isAnonymous === 'true',
      submittedBy: isAnonymous === 'true' ? null : req.user.id,
      fileUrl: req.file ? req.file.path : null
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

router.get('/mycases/secretariat', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const cases = await Case.find({ assignedBy: req.user.id })
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/run-escalation', auth, allowRoles('admin', 'secretariat'), async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cases = await Case.find({
      status: 'Assigned',
      assignedAt: { $lt: sevenDaysAgo }
    });
    for (const c of cases) {
      c.status = 'Escalated';
      await c.save();
    }
    res.json({ message: `Escalation done. ${cases.length} cases escalated.` });
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
      .populate('assignedBy', 'name')
      .populate('notes.addedBy', 'name');
    if (!found) return res.status(404).json({ message: 'Case not found' });
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/assign', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    if (found.assignedBy &&
      found.assignedBy.toString() !== req.user.id &&
      req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the secretariat who assigned this case or admin can reassign it' });
    }
    if (!found.assignmentHistory) found.assignmentHistory = [];
    found.assignedTo = req.body.assignedTo;
    found.assignedBy = req.user.id;
    found.status = 'Assigned';
    found.assignedAt = new Date();
    found.assignmentHistory.push({
      assignedTo: req.body.assignedTo,
      assignedBy: req.user.id,
      assignedAt: new Date()
    });
    await found.save();
    const updated = await Case.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name');
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

router.delete('/:id/notes/:noteId', auth, allowRoles('case_manager', 'secretariat', 'admin'), async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    found.notes = found.notes.filter(n => n._id.toString() !== req.params.noteId);
    await found.save();
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/notes/:noteId', auth, allowRoles('case_manager', 'secretariat', 'admin'), async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    const note = found.notes.id(req.params.noteId);
    note.text = req.body.text;
    await found.save();
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/resolve', auth, allowRoles('case_manager'), async (req, res) => {
  try {
    const { summary, outcome } = req.body;
    const found = await Case.findById(req.params.id);
    found.resolution = {
      summary,
      outcome,
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    };
    found.status = 'Resolved';
    await found.save();
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;