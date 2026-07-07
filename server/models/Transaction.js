const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please add a positive amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: [true, 'Please add a transaction type'],
      enum: ['income', 'expense']
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Salary', 'Others']
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
