import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const JobForm = ({ jobs, setJobs, editingJob, setEditingJob }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', company: '', location: '', salary: '', deadline: '' });

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        description: editingJob.description,
        company: editingJob.company || '',
        location: editingJob.location || '',
        salary: editingJob.salary || '',
        deadline: editingJob.deadline,
      });
    } else {
      setFormData({ title: '', description: '', company: '', location: '', salary: '', deadline: '' });
    }
  }, [editingJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        const response = await axiosInstance.put(`/api/jobs/${editingJob._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setJobs(jobs.map((job) => (job._id === response.data._id ? response.data : job)));
      } else {
        const response = await axiosInstance.post('/api/jobs', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setJobs([...jobs, response.data]);
      }
      setEditingJob(null);
      setFormData({ title: '', description: '', company: '', location: '', salary: '', deadline: '' });
    } catch (error) {
      alert('Failed to save job.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingJob ? 'Edit Job' : 'Create Job'}</h1>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Company"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Salary"
        value={formData.salary}
        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingJob ? 'Update Job' : 'Create Job'}
      </button>
    </form>
  );
};

export default JobForm;
