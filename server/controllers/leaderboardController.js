const Submission = require('../models/Submission');

// @route   GET /api/leaderboard
// @desc    Get global leaderboard ranked by problems solved
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    // Aggregation pipeline to calculate leaderboard
    const pipeline = [
      // Step 1: Filter to only accepted submissions to find unique problems solved
      {
        $facet: {
          solvedStats: [
            { $match: { verdict: 'Accepted' } },
            { $group: {
                _id: { user: '$user', problem: '$problem' }
            }},
            { $group: {
                _id: '$_id.user',
                problemsSolved: { $sum: 1 }
            }}
          ],
          totalStats: [
            { $group: {
                _id: '$user',
                totalSubmissions: { $sum: 1 },
                acceptedSubmissions: {
                  $sum: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, 1, 0] }
                }
            }}
          ]
        }
      },
      // Restructure the facet output
      { $project: {
          stats: { $concatArrays: ['$solvedStats', '$totalStats'] }
      }},
      { $unwind: '$stats' },
      { $group: {
          _id: '$stats._id',
          problemsSolved: { $max: '$stats.problemsSolved' },
          totalSubmissions: { $max: '$stats.totalSubmissions' },
          acceptedSubmissions: { $max: '$stats.acceptedSubmissions' }
      }},
      // Calculate acceptance rate
      { $project: {
          _id: 1,
          problemsSolved: { $ifNull: ['$problemsSolved', 0] },
          totalSubmissions: { $ifNull: ['$totalSubmissions', 0] },
          acceptanceRate: {
            $cond: [
              { $eq: ['$totalSubmissions', 0] },
              0,
              { $multiply: [{ $divide: ['$acceptedSubmissions', '$totalSubmissions'] }, 100] }
            ]
          }
      }},
      // Sort: Most solved first, then fewest submissions (tiebreaker)
      { $sort: { problemsSolved: -1, totalSubmissions: 1 } },
      
      // Lookup user details
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
      }},
      { $unwind: '$user' },
      
      // Final projection
      { $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          problemsSolved: 1,
          totalSubmissions: 1,
          acceptanceRate: { $round: ['$acceptanceRate', 1] }
      }}
    ];

    const allUsers = await Submission.aggregate(pipeline);
    
    // Add Rank
    const rankedUsers = allUsers.map((u, index) => ({
      ...u,
      rank: index + 1
    }));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = rankedUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      leaderboard: paginated,
      pagination: {
        page,
        limit,
        total: rankedUsers.length
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
