const mongoose = require('mongoose');


const JobPostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    description: { type: String },
    company: { type: String },
    location: { type: String },
    salary: { type: Number },
    deadline: { type: Date },
    completed: { type: Boolean, default: false }
});


module.exports = mongoose.model('Job', JobPostSchema);
