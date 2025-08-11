import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const JobList = ({ jobs, setJobs, setEditingJob }) => {
  const { user } = useAuth();

  const handleDelete = async (jobId) => {
    try {
      await axiosInstance.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (error) {
      alert('Failed to delete job.');
    }
  };


  return (
    <div>
      {jobs.map((job) => (
        <div key={job._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{job.title}</h2>
          <p>{job.description}</p>
          <p className="text-sm text-gray-500">Company: { job.company || 'N/A' }</p>
          <p className="text-sm text-gray-500">Location: { job.location || 'N/A' }</p>
          <p className="text-sm text-gray-500">Salary: { job.salary ? `$${job.salary}`: 'N/A' }</p>
          <p className="text-sm text-gray-500">Deadline: { job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A' }</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingJob(job)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(job._id)}
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

export default JobList;

