// JobCard.tsx
import API_BASE_URL from '../api'; // Add this import
import React, { useState, useRef } from 'react';
import './JobCard.css';
import { FiCopy, FiCheck } from 'react-icons/fi'; // Import icons (install with: npm install react-icons)

interface JobData {
  
  title: string;
  company: string;
  city: string;
  description: string;
  salary_range?: string;
  employment_type?: string;
  posted_at?: string;
  apply_link: string;
  employer_website?: string;
  employer_logo?: string;
}

interface JobCardProps {
  job: JobData;
  userId: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, userId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format the date if it exists
  const formattedDate = job.posted_at 
    ? new Date(job.posted_at).toLocaleDateString() 
    : '';

  const handleSaveJob = async () => {
    console.log("Save button clicked for job:", job.title);
    if (isSaved) return; // Prevent duplicate saves
    
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: job.title,
          company_name: job.company,
          apply_link: job.apply_link
        }),
      });
      
      if (response.ok) {
        setIsSaved(true);
      } else {
        console.error('Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyJob = () => {
    // Create a formatted job description string
    const jobText = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.city}
${job.employment_type ? `Job Type: ${job.employment_type}` : ''}
${job.salary_range && job.salary_range !== " - " ? `Salary Range: ${job.salary_range}` : ''}
${formattedDate ? `Posted: ${formattedDate}` : ''}

Description:
${job.description}

Apply Link: ${job.apply_link}
${job.employer_website ? `Company Website: ${job.employer_website}` : ''}
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(jobText).then(() => {
      setIsCopied(true);
      
      // Reset "Copied" state after 2 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <span className="job-company">{job.company}</span>
        
        {/* Copy button with tooltip */}
        <div className="copy-button-container">
          <button 
            className="copy-button" 
            onClick={handleCopyJob}
            aria-label="Copy job details"
          >
            {isCopied ? <FiCheck /> : <FiCopy />}
            <span className="tooltip">{isCopied ? "Copied!" : "Copy response"}</span>
          </button>
        </div>
      </div>
      
      <div className="job-details">
        <div className="job-location-type">
          <span className="job-location">{job.city}</span>
          {job.employment_type && (
            <span className="job-type">{job.employment_type}</span>
          )}
        </div>
        
        {job.salary_range && job.salary_range !== " - " && (
          <div className="job-salary">
            <span>Salary: {job.salary_range}</span>
          </div>
        )}
        
        {formattedDate && (
          <div className="job-date">
            <span>Posted: {formattedDate}</span>
          </div>
        )}
      </div>
      
      <div className="job-description">
        <p>{job.description}</p>
      </div>
      
      <div className="job-actions">
        <a 
          href={job.apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apply-button"
        >
          Apply Now
        </a>
        
        {job.employer_website && (
          <a 
            href={job.employer_website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="website-button"
          >
            Company Website
          </a>
        )}
        
        <button
          onClick={handleSaveJob}
          disabled={isSaving || isSaved}
          className={`save-button ${isSaved ? 'saved' : ''}`}
        >
          {isSaved ? '✓ Saved' : isSaving ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;