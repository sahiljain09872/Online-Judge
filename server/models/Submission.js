const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem:  { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code:     { type: String, required: true },
  language: { type: String, enum: ['cpp', 'python', 'java'], required: true },

  // Status lifecycle: queued → processing → (final verdict)
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },

  // Final verdict (set when status = 'completed')
  verdict: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'TLE', 'MLE', 'Runtime Error', 'Compilation Error', null],
    default: null
  },

  // Execution metrics
  executionTime:   { type: Number, default: null },  // Max across test cases, in ms
  memoryUsed:      { type: Number, default: null },  // Max across test cases, in MB
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases:  { type: Number, default: 0 },

  // Error details (compilation error message, runtime error, etc.)
  errorMessage: {
    type: String
  },
  isRun: {
    type: Boolean,
    default: false
  },
  customInput: {
    type: String,
    default: null
  },
  testCaseResults: {
    type: Array,
    default: []
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },

  // BullMQ job reference
  jobId:{ type: String, default: null }
}, { timestamps: true });

// Index for efficient queries
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
