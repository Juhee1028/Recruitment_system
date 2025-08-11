const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getJobs, addJob, updateJob, deleteJob } = require('../controllers/jobpostController');
const router = express.Router();


router.route('/').get(protect, getJobs).post(protect, addJob);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
