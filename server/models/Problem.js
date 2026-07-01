const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a problem name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add a problem code/slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    statement: {
      type: String,
      required: [true, 'Please add a problem statement'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      default: 'Easy',
    },
    sampleInput: {
      type: String,
    },
    sampleOutput: {
      type: String,
    },
    constraints: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Problem', problemSchema);
