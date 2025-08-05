const JobPost = require('../models/JobPost');

const getJobs = async (req, res) => {
    try {
        const jobs = await JobPost.find({userId: req.user.id});
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addJob = async (req, res) => {
    const { title, description, company, location, salary, deadline, completed } = req.body;
    try {
        const job = await JobPost.create({
            userId: req.user.id,
            title,
            description,
            company,
            location,
            salary,
            deadline,
            completed
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateJob = async (req, res) => {
    const { title, description, company, location, salary, deadline, completed } = req.body;
    try {
        const job = await JobPost.findById (req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found'});

        job.title = title || job.title;
        job.description = description || job.description;
        job.company = company || job.company;
        job.location = location || job.location;
        job.salary = salary ?? job.salary;
        job.deadline= deadline || job.deadline;
        job.completed = completed ?? job.completed;

        const updatedJob = await job.save();
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await JobPost.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found'});

        await job.remove();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getJobs, addJob, updateJob, deleteJob };
