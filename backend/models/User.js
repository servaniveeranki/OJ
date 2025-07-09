const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    // Problem solving statistics
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
    }],
    problemsSolved: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    submissionStats: {
        accepted: { type: Number, default: 0 },
        wrongAnswer: { type: Number, default: 0 },
        timeLimitExceeded: { type: Number, default: 0 },
        runtimeError: { type: Number, default: 0 },
        compilationError: { type: Number, default: 0 }
    },
    streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastSubmissionDate: { type: Date }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);