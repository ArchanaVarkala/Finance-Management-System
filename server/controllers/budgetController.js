const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get user budget for a specific month and year, including progress
// @route   GET /api/budget
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const today = new Date();
    const month = parseInt(req.query.month) || today.getMonth() + 1;
    const year = parseInt(req.query.year) || today.getFullYear();

    // Find the budget
    let budget = await Budget.findOne({ user: req.user.id, month, year });

    // If no budget exists, we can default to 0 or return null.
    // Let's return a default budget object with 0 amount to make client integration simple.
    if (!budget) {
      budget = {
        amount: 0,
        month,
        year,
        user: req.user.id
      };
    }

    // Calculate total expenses for this month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseAggregate = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpense = expenseAggregate.length > 0 ? expenseAggregate[0].total : 0;
    const remaining = budget.amount - totalExpense;
    
    // Progress percentage
    const progress = budget.amount > 0 ? Math.min((totalExpense / budget.amount) * 100, 100) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        budget: budget.amount ? budget : null,
        budgetAmount: budget.amount,
        month,
        year,
        totalExpense,
        remaining,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update monthly budget
// @route   POST /api/budget
// @access  Private
exports.setBudget = async (req, res, next) => {
  try {
    const { amount, month, year } = req.body;

    if (amount === undefined || !month || !year) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide budget amount, month, and year'
      });
    }

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, month, year },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};
