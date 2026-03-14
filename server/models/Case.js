const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  trackingId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Safety', 'Policy', 'Facilities', 'HR', 'Other'],
    required: true 
  },
  department: { type: String, required: true },
  location: { type: String },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'],
    default: 'Low' 
  },
  status: { 
    type: String, 
    enum: ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'],
    default: 'New' 
  },
  isAnonymous: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{ 
    text: String, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  resolution: {
  summary: { type: String },
  outcome: { type: String, enum: ['Resolved', 'No Action Required', 'Referred', 'Escalated'] },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
},
assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: { type: String },
  assignedAt: { type: Date }
}, { timestamps: true });

// Auto-generate tracking ID before saving
caseSchema.pre('save', async function() {
  if (!this.trackingId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Case').countDocuments();
    this.trackingId = `NEO-${year}-${String(count + 1).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('Case', caseSchema);