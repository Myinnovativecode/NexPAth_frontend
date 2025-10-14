// SavedJobsList.tsx
import React, { useEffect, useState } from 'react';
import './SavedJobsList.css';
import API_BASE_URL from '../api'; // ✅ Add this import

interface SavedJob {
  id: number;
  job_title: string;
  company_name: string;
  apply_link: string;
  saved_at: string;
}

interface SavedJobsListProps {
  userId: string;
}

const SavedJobsList: React.FC<SavedJobsListProps> = ({ userId }) => {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingJobs, setDeletingJobs] = useState<number[]>([]);

  const fetchSavedJobs = async () => {
    if (!userId) {
      console.warn("No userId provided to SavedJobsList");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching saved jobs for user:", userId);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/dashboard`); // ✅ Changed
      console.log("Dashboard response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch dashboard: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Dashboard data:", data);
      
      if (!data.saved_jobs) {
        console.warn("No saved_jobs property in dashboard response");
        setSavedJobs([]);
      } else {
        console.log("Saved jobs from response:", data.saved_jobs);
        setSavedJobs(data.saved_jobs);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      setError(error instanceof Error ? error.message : String(error));
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // New function to handle deleting a job
  const handleDeleteJob = async (jobId: number) => {
    if (!userId) return;
    
    // Add job ID to the deleting array to show loading state
    setDeletingJobs(prev => [...prev, jobId]);
    
    try {
      console.log(`Deleting job ${jobId} for user ${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/jobs/${jobId}`, { // ✅ Changed
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete job: ${response.status} - ${errorText}`);
      }
      
      console.log(`Job ${jobId} successfully deleted`);
      
      // Remove the job from the local state immediately for better UX
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error(`Error deleting job ${jobId}:`, error);
      setError(`Failed to delete job: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // Remove job ID from the deleting array
      setDeletingJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  useEffect(() => {
    console.log("SavedJobsList received userId:", userId);
    fetchSavedJobs();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchSavedJobs, 30000);
    
    // Add event listener for jobSaved events
    const handleJobSaved = () => {
      console.log("Job saved event detected, refreshing jobs list");
      fetchSavedJobs();
    };
    window.addEventListener('jobSaved', handleJobSaved);
    
    // Clean up interval and event listener on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('jobSaved', handleJobSaved);
    };
  }, [userId]);

  if (loading && savedJobs.length === 0) {
    return <div className="saved-jobs-loading">Loading saved jobs...</div>;
  }

  if (error) {
    return <div className="saved-jobs-error">Error loading saved jobs: {error}</div>;
  }

  if (savedJobs.length === 0) {
    return <div className="no-saved-jobs">No saved jobs yet</div>;
  }

  return (
    <div className="saved-jobs-list">
      {/* Manual refresh button */}
      <button 
        onClick={fetchSavedJobs} 
        className="refresh-button"
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Jobs'}
      </button>

      {savedJobs.map((job) => (
        <div key={job.id} className="saved-job-item">
          <h4 className="saved-job-title">{job.job_title}</h4>
          <p className="saved-job-company">{job.company_name}</p>
          <div className="saved-job-footer">
            <div className="saved-job-actions">
              <a 
                href={job.apply_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="saved-job-apply"
              >
                Apply Now
              </a>
              
              {/* Unsave button */}
              <button 
                onClick={() => handleDeleteJob(job.id)}
                disabled={deletingJobs.includes(job.id)}
                className="unsave-button"
              >
                {deletingJobs.includes(job.id) ? 'Removing...' : 'Unsave'}
              </button>
            </div>
            <span className="saved-job-date">
              {new Date(job.saved_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedJobsList;