const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add a monthly budget amount'],
      min: [0, 'Budget cannot be negative']
    },
    month: {
      type: Number,
      required: [true, 'Please specify the month (1-12)'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Please specify the year'],
      min: 2000
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique budget per user per month/year
BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
