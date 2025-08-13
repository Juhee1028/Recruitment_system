import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AssessmentQAList = ({ questions, setQuestions, setEditingQuestion }) => {
  const { user } = useAuth();

  const handleDelete = async (questionId) => {
    try {
      await axiosInstance.delete(`/api/assessment-questions/${questionId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setQuestions(questions.filter((question) => question._id !== questionId));
    } catch (error) {
      alert('Failed to delete question.');
    }
  };


  return (
    <div>
      {questions.map((question) => (
        <div key={question._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">Question:</h2>
          <p className = "mb-2">{question.questionText}</p>
          <p className="text-sm text-gray-500">Correct Answer: { question.correctAnswer || 'N/A' }</p>
          <p className="text-sm text-gray-500">Time Limit: { question.timeLimit > 0 ?`${question.timeLimit} seconds` : 'No limit' }</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingQuestion(question)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(question._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentQAList;

