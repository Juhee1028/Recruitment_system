const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getQuestions, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/assessmentQAController');
const router = express.Router();


router.route('/:jobId').get(protect, getQuestions)
router.route('/').post(protect, addQuestion);
router.route('/:id').put(protect, updateQuestion).delete(protect, deleteQuestion);

module.exports = router;
