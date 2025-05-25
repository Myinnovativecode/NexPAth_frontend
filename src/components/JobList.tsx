import React, { useState, useEffect } from 'react';

// Define the shape of a job object
interface Job {
  id: string;
  title: string;
  company: string;
  job_apply_link: string;
}

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);  // Array of jobs with type definition
  const [loading, setLoading] = useState<boolean>(false);  // Boolean for loading state
  const jobsPerPage = 10; // Number of jobs per API request
  const [page, setPage] = useState<number>(1); // Track the current page

  // Fetch job data from the backend API
  const fetchJobs = () => {
    setLoading(true);
    fetch(`/api/jobs?page=${page}&limit=${jobsPerPage}`)
      .then(response => response.json())
      .then((data: { jobs: Job[] }) => {
        setJobs(prevJobs => [...prevJobs, ...data.jobs]);  // Append new jobs to existing ones
        setLoading(false);
        setPage(prevPage => prevPage + 1);  // Increment page number for next fetch
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();  // Initial job fetch when component mounts
  }, []);  // Empty dependency array to fetch only once when the component is mounted

  // Handle scroll event to detect when user reaches the bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const bottom = target.scrollHeight === target.scrollTop + target.clientHeight;
    if (bottom && !loading) {
      fetchJobs();
    }
  };
  

  return (
    <div onScroll={handleScroll} style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">Apply Here</a>
          </li>
        ))}
      </ul>
      {loading && <p>Loading more jobs...</p>} {/* Show loading text while fetching */}
    </div>
  );
};

export default JobList;

