const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: True },
    title: { type: String, required: True },
    description: { type: String },
    company: { type: String },
    location: { type: String },
    salary: { type: Number },
    deadline: { type: Date },
});

module.exports = mongoose.model('Job', JobPostSchema);