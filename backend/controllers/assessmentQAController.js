const AssessmentQA = require('../models/AssessmentQA');
const JobPost = require('../models/AssessmentQA');


const getQuestions = async (req, res) => {
    try {
        const questions = await AssessmentQA.find({jobId: req.job.id});
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addQuestion = async (req, res) => {
    const { questionText, correctAnswer, timeLimit } = req.body;
    try {
        const newQuestion = await JobPost.create({
            jobId: req.job.id,
            questionText,
            correctAnswer,
            timeLimit,
        });
        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const { questionText, correctAnswer, timeLimit  } = req.body;
    try {
        const question = await AssessmentQA.findById (req.params.id);
        if (!question) return res.status(404).json({ message: 'question not found'});

        job.questionText = questionText || question.questionText;
        job.correctAnswer = correctAnswer || question.correctAnswer;
        job.timeLimit = timeLimit ?? question.timeLimit;

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const question = await AssessmentQA.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'question not found'});

        await question.remove();
        res.json({ message: 'question deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getQuestions, addQuestion, updateQuestion, deleteQuestion };
