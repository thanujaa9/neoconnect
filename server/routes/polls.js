const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { auth, allowRoles } = require('../middleware/auth');

router.post('/', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = new Poll({
      question,
      options: options.map(text => ({ text, votes: [] })),
      createdBy: req.user.id
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is closed' });
    }

    const alreadyVoted = poll.options.some(opt => 
      opt.votes.includes(req.user.id)
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    const option = poll.options.id(req.body.optionId);
    option.votes.push(req.user.id);
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/close', auth, allowRoles('secretariat', 'admin'), async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;