import React, { useState, useEffect } from 'react';

interface JobListProps {
  userId: string;
}

// Define the shape of a job object
interface Job {
  id: string;
  title: string;
  company: string;
  job_apply_link: string;
}

const JobList: React.FC<JobListProps> = ({ userId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const jobsPerPage = 10;
  const [page, setPage] = useState<number>(1);

  const fetchJobs = () => {
    setLoading(true);
    fetch(`/api/jobs?userId=${userId}&page=${page}&limit=${jobsPerPage}`)
      .then(response => response.json())
      .then((data: { jobs: Job[] }) => {
        setJobs(prevJobs => [...prevJobs, ...data.jobs]);
        setLoading(false);
        setPage(prevPage => prevPage + 1);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
      {loading && <p>Loading more jobs...</p>}
    </div>
  );
};

export default JobList;


