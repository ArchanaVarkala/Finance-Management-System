const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { search, category, type } = req.query;
    let query = { user: req.user.id };

    // Search query parameter
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Category query parameter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Type query parameter (income vs expense)
    if (type && type !== 'All') {
      query.type = type;
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { description, amount, type, category, date } = req.body;

    if (!description || !amount || !type || !category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide description, amount, type, and category'
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      description,
      amount,
      type,
      category,
      date: date || new Date()
    });

    res.status(201).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found'
      });
    }

    // Check transaction user matches req.user.id
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized to edit this transaction'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        status: 'fail',
        message: 'Transaction not found'
      });
    }

    // Check transaction user matches req.user.id
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
