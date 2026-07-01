const User = require('../models/User');
const Submission = require('../models/Submission');

// @route   GET /api/users/:id/profile
// @desc    Get user profile and stats
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Get problems solved count
    const uniqueAccepted = await Submission.distinct('problem', { user: userId, verdict: 'Accepted' });
    const problemsSolved = uniqueAccepted.length;

    // 2. Get total submissions & acceptance rate
    const totalSubmissions = await Submission.countDocuments({ user: userId });
    const acceptedSubmissions = await Submission.countDocuments({ user: userId, verdict: 'Accepted' });
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    // 3. Get language breakdown & favorite language
    const langStats = await Submission.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    let favoriteLanguage = 'N/A';
    const languageBreakdown = {};
    if (langStats.length > 0) {
      favoriteLanguage = langStats[0]._id;
      langStats.forEach(stat => {
        languageBreakdown[stat._id] = stat.count;
      });
    }

    // 4. Get difficulty breakdown (Easy, Medium, Hard)
    const diffStats = await Submission.aggregate([
      { $match: { user: user._id, verdict: 'Accepted' } },
      { $group: { _id: '$problem' } }, // unique problems
      { $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problemDoc'
      }},
      { $unwind: '$problemDoc' },
      { $group: { _id: '$problemDoc.difficulty', count: { $sum: 1 } } }
    ]);

    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    diffStats.forEach(stat => {
      difficultyBreakdown[stat._id] = stat.count;
    });

    // 5. Recent Submissions (Last 10)
    const recentSubmissions = await Submission.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('problem', 'name code difficulty')
      .select('problem language verdict executionTime memoryUsed createdAt');

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      stats: {
        problemsSolved,
        totalSubmissions,
        acceptanceRate: acceptanceRate.toFixed(1),
        favoriteLanguage,
        languageBreakdown,
        difficultyBreakdown
      },
      recentSubmissions
    });

  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
