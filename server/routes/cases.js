const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Case = require('../models/Case');
const { auth, allowRoles } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('body:', req.body);
    const { title, description, category, department, location, severity, isAnonymous } = req.body;
    const caseData = {
      title, description, category, department, location, severity,
      isAnonymous: isAnonymous === 'true',
      submittedBy: isAnonymous === 'true' ? null : req.user.id,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    console.log('caseData:', caseData);
    const newCase = new Case(caseData);
    console.log('saving...');
    await newCase.save();
    console.log('saved:', newCase.trackingId);
    res.status(201).json(newCase);
  } catch (err) {
    console.log('ERROR:', err.message);
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
      .populate('assignedBy', 'name')
      .populate('notes.addedBy', 'name');
    if (!found) return res.status(404).json({ message: 'Case not found' });
    res.json(found);
  } catch (err) {
    console.log('ERROR:', err.message);
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

    if (!found.assignmentHistory) {
      found.assignmentHistory = [];
    }

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
    console.log('assign error:', err.message);
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
router.post('/run-escalation', auth, allowRoles('admin', 'secretariat'), async (req, res) => {
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
module.exports = router;