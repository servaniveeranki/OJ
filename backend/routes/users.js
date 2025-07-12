const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track user submission statistics
router.post('/track-submission', async (req, res) => {
  try {
    const { userId, problemId, status } = req.body;
    
    if (!userId || !problemId) {
      return res.status(400).json({ message: 'User ID and Problem ID are required' });
    }
    
    console.log(`Tracking submission for user ${userId}, problem ${problemId}, status: ${status}`);
    
    // Use findByIdAndUpdate to safely update fields that might not exist yet
    const updateData = {
      $inc: { totalSubmissions: 1 }
    };
    
    // Update submission stats based on status
    if (status === 'Accepted') {
      updateData.$inc['submissionStats.accepted'] = 1;
      
      // Check if problem is already solved by this user
      const user = await User.findById(userId);
      if (user) {
        const alreadySolved = user.solvedProblems && 
                             user.solvedProblems.some(id => id.toString() === problemId.toString());
        
        if (!alreadySolved) {
          // Add to solved problems and increment count
          updateData.$inc.problemsSolved = 1;
          updateData.$push = { solvedProblems: problemId };
        }
      }
    } else if (status === 'Wrong Answer') {
      updateData.$inc['submissionStats.wrongAnswer'] = 1;
    } else if (status === 'Time Limit Exceeded') {
      updateData.$inc['submissionStats.timeLimitExceeded'] = 1;
    } else if (status === 'Runtime Error') {
      updateData.$inc['submissionStats.runtimeError'] = 1;
    } else if (status === 'Compilation Error') {
      updateData.$inc['submissionStats.compilationError'] = 1;
    }
    
    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get current user to check streak
    const currentUser = await User.findById(userId);
    if (currentUser) {
      if (!currentUser.streak) {
        // Initialize streak for first submission
        updateData.$set = {
          'streak.current': 1,
          'streak.longest': 1,
          'streak.lastSubmissionDate': today
        };
      } else {
        const lastDate = currentUser.streak.lastSubmissionDate ? 
                         new Date(currentUser.streak.lastSubmissionDate) : null;
        
        if (lastDate) {
          lastDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day
            const newCurrent = (currentUser.streak.current || 0) + 1;
            updateData.$set = {
              'streak.current': newCurrent,
              'streak.lastSubmissionDate': today
            };
            
            if (newCurrent > (currentUser.streak.longest || 0)) {
              updateData.$set['streak.longest'] = newCurrent;
            }
          } else if (diffDays > 1) {
            // Streak broken
            updateData.$set = {
              'streak.current': 1,
              'streak.lastSubmissionDate': today
            };
          } else {
            // Same day, just update date
            updateData.$set = { 'streak.lastSubmissionDate': today };
          }
        } else {
          // No last date, initialize
          updateData.$set = {
            'streak.current': 1,
            'streak.longest': Math.max(1, currentUser.streak.longest || 0),
            'streak.lastSubmissionDate': today
          };
        }
      }
    }
    
    // Update the user with all changes
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, upsert: false }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User statistics updated successfully');
    
    res.json({
      message: 'User statistics updated successfully',
      stats: {
        totalSubmissions: updatedUser.totalSubmissions || 0,
        problemsSolved: updatedUser.problemsSolved || 0,
        streak: updatedUser.streak || { current: 0, longest: 0 }
      }
    });
  } catch (error) {
    console.error('Error updating user statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user submission history
router.get('/submissions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('problemsSolved totalSubmissions submissionStats streak');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get submission distribution by language
    const languageStats = await Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);
    
    // Get daily submission activity for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const dailyActivity = await Submission.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
          },
          count: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get difficulty distribution
    const difficultyStats = await Submission.aggregate([
      {
        $match: { 
          user: userId,
          status: "Accepted"
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "problem",
          foreignField: "_id",
          as: "problemDetails"
        }
      },
      { $unwind: "$problemDetails" },
      {
        $group: {
          _id: "$problemDetails.difficulty",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the daily activity data for the calendar
    const activityData = {};
    dailyActivity.forEach(day => {
      activityData[day._id] = {
        submissions: day.count,
        accepted: day.acceptedCount
      };
    });
    
    res.json({
      problemsSolved: user.problemsSolved || 0,
      totalSubmissions: user.totalSubmissions || 0,
      submissionStats: user.submissionStats || {
        accepted: 0,
        wrongAnswer: 0,
        timeLimitExceeded: 0,
        runtimeError: 0,
        compilationError: 0
      },
      streak: user.streak || { current: 0, longest: 0 },
      languageDistribution: languageStats.map(item => ({
        language: item._id,
        count: item.count
      })),
      dailyActivity: activityData,
      difficultyDistribution: {
        Easy: difficultyStats.find(d => d._id === 'Easy')?.count || 0,
        Medium: difficultyStats.find(d => d._id === 'Medium')?.count || 0,
        Hard: difficultyStats.find(d => d._id === 'Hard')?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific submission/solution
router.get('/submission/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId)
      .populate('problem', 'title difficulty functionName functionSignature')
      .populate('user', 'firstname lastname');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
