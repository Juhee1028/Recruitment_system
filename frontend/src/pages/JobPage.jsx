import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JobPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get('/api/jobs', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setJobs(response.data);
      } catch (error) {
        alert('Failed to fetch jobs.');
      }
    };

    fetchJobs();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <JobForm
        jobs={jobs}
        setJobs={setJobs}
        editingJob={editingJob}
        setEditingJob={setEditingJob}
      />
      <JobList jobs={jobs} setJobs={setJobs} setEditingJob={setEditingJob} navigate = {navigate} />
    </div>
  );
};

export default JobPage;


