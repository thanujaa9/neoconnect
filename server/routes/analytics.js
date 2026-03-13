const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { auth, allowRoles } = require('../middleware/auth');

router.get('/', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const byDepartment = await Case.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const byStatus = await Case.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byCategory = await Case.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const hotspots = await Case.aggregate([
      { $group: { _id: { department: '$department', category: '$category' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);

    res.json({ byDepartment, byStatus, byCategory, hotspots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;