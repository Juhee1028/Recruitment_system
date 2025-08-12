const mongoose = require('mongoose');


const assessmentQASchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
    questionText: { type: String },
    correctAnswer: { type: String },
    timeLimit: { type: Number, default: 0},
});


module.exports = mongoose.model('AssessmentQA', assessmentQASchema);
