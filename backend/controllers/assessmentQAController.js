const AssessmentQA = require('../models/AssessmentQA');
const JobPost = require('../models/JobPost');


const getQuestions = async (req, res) => {
    try {
        const questions = await AssessmentQA.find({jobId: req.params.jobId});
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addQuestion = async (req, res) => {
    const { jobId, questionText, correctAnswer, timeLimit } = req.body;
    if (!jobId){
        return res.status(400).json({ message: 'jobId is required'});
    }
    try {
        const newQuestion = await AssessmentQA.create({
            jobId,
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

        question.questionText = questionText || question.questionText;
        question.correctAnswer = correctAnswer || question.correctAnswer;
        question.timeLimit = timeLimit ?? question.timeLimit;

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
