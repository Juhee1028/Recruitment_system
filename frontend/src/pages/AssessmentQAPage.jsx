import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import AssessmentQAForm from '../components/AssessmentQAForm';
import AssessmentQAList from '../components/AssessmentQAList';
import { useAuth } from '../context/AuthContext';

const AssessmentQAPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);


  useEffect(() => {
    if (!jobId) return;

    const fetchQuestions = async () => {
      try {
        const response = await axiosInstance.get(`/api/assessment-questions/${jobId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setQuestions(response.data);
      } catch (error) {
        alert('Failed to fetch questions.');
      }
    };

    fetchQuestions();
  }, [user, jobId]);

  return (
    <div className="container mx-auto p-6">
      <AssessmentQAForm
        jobId={jobId}
        questions = {questions}
        setQuestions={setQuestions}
        editingQuestion={editingQuestion}
        setEditingQuestion={setEditingQuestion}
      />
      <AssessmentQAList questions={questions} setQuestions={setQuestions} setEditingQuestion={setEditingQuestion} />
    </div>
  );
};

export default AssessmentQAPage;


