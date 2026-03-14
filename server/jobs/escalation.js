const cron = require('node-cron');
const Case = require('../models/Case');

const runEscalation = () => {
  cron.schedule('0 9 * * 1-5', async () => {
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
        console.log(`Escalated case: ${c.trackingId}`);
      }

      console.log(`Escalation check done. ${cases.length} cases escalated.`);
    } catch (err) {
      console.log('Escalation error:', err.message);
    }
  });
};

module.exports = runEscalation;