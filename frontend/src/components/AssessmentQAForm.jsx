import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AssessmentQAForm = ({ jobId, questions, setQuestions, editingQuestion, setEditingQuestion }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ questionText: '', correctAnswer: '', timeLimit: 0, });

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        questionText: editingQuestion.questionText,
        correctAnswer: editingQuestion.correctAnswer || '',
        timeLimit: editingQuestion.timeLimit || 0 ,
      });
    } else {
      setFormData({ questionText: '', correctAnswer: '', timeLimit: 0 });
    }
  }, [editingQuestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingQuestion) {
        const response = await axiosInstance.put(`/api/assessment-questions/${editingQuestion._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setQuestions(questions.map((questions) => (questions._id === response.data._id ? response.data : questions)));
      } else {
        const response = await axiosInstance.post('/api/assessment-questions', {...formData, jobId }, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setQuestions([...questions, response.data]);
      }
      setEditingQuestion(null);
      setFormData({ questionText: '', correctAnswer: '', timeLimit: 0 });
    } catch (error) {
      alert('Failed to save question.');
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingQuestion ? 'Edit question' : 'Create question'}</h1>
      <input
        type="text"
        placeholder="Question Text"
        value={formData.questionText}
        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Correct Answer"
        value={formData.correctAnswer}
        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Time Limit (seconds, 0 = no limit)"
        value={formData.timeLimit}
        onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value)})}
        className="w-full mb-4 p-2 border rounded"
      />
      
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingQuestion ? 'Update Question' : 'Create Question'}
      </button>
    </form>
  );
};

export default AssessmentQAForm;

