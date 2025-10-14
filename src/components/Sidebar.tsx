// In Sidebar.tsx
import API_BASE_URL from '../api';
import React, { useState, useEffect } from 'react';
// Import icons you'll need
import { FiBookmark, FiFileText, FiCalendar, FiSun, FiMessageCircle } from 'react-icons/fi';
import './Sidebar.css'; // We will update this file next
import SavedJobsList from './SavedJobsList'; // Import the new component
// Define the new interfaces to match the backend response
import ResumeItem from './ResumeItem';


interface SavedJob {
  id: number;
  job_title: string;
  company_name: string;
  apply_link?: string;
}

interface Document {
  id: number;
  file_name: string;
  download_url: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  event_date: string;
  join_link?: string;
}

interface CareerTip {
  tip_text: string;
}

interface DashboardData {
  saved_jobs: SavedJob[];
  documents: Document[];
  upcoming_events: UpcomingEvent[];
  career_tip: CareerTip | null;
}

interface SidebarProps {
  userId: string;
  onNewChat: () => void;
  className?: string;
}

// A new reusable component for the accordion
const AccordionItem = ({ title, icon, count, children }: { title: string, icon: React.ReactNode, count: number, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title">
          {icon}
          <span>{title}</span>
          <span className="item-count">({count})</span>
        </div>
        <span className={`accordion-chevron ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ userId, onNewChat, className }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/dashboard`); // ✅ Changed
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
  };

  return (
    <div className={`sidebar-container ${className}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">NexPath</h1>
      </div>

      <button className="new-chat-btn" onClick={handleNewChatClick}>
        <FiMessageCircle size={18} /> {/* Add an icon */}
        New Chat
      </button>

      <div className="dashboard-content">
        {loading ? (
          <div className="empty-history">Loading Dashboard...</div>
        ) : !dashboardData ? (
          <div className="empty-history">Could not load dashboard.</div>
        ) : (
          <>
            <h2 className="dashboard-title">My Dashboard</h2>

            <AccordionItem
              title="Saved Jobs"
              icon={<FiBookmark />}
              count={dashboardData.saved_jobs.length}
            >
              <SavedJobsList userId={userId} />
            </AccordionItem>

            <AccordionItem title="My Documents" icon={<FiFileText />} count={dashboardData.documents.length}>
              {dashboardData.documents.length > 0 ? (
                dashboardData.documents.map(doc => (
                  <ResumeItem
                    key={doc.id}
                    id={doc.id}
                    fileName={doc.file_name}
                    downloadUrl={doc.download_url}
                    userId={userId}
                    onDelete={(id) => {
                      // Update the dashboard data to remove the deleted resume
                      setDashboardData(prev => prev ? {
                        ...prev,
                        documents: prev.documents.filter(d => d.id !== id)
                      } : null);
                    }}
                    onRename={(id, newName) => {
                      // Update the dashboard data with the new name
                      setDashboardData(prev => prev ? {
                        ...prev,
                        documents: prev.documents.map(d =>
                          d.id === id ? { ...d, file_name: newName } : d
                        )
                      } : null);
                    }}
                  />
                ))
              ) : <div className="empty-section">No documents created.</div>}
            </AccordionItem>
            

            <AccordionItem title="Upcoming Events" icon={<FiCalendar />} count={dashboardData.upcoming_events.length}>
              {dashboardData.upcoming_events.length > 0 ? (
                dashboardData.upcoming_events.map(event => (
                  <div key={event.id} className="dashboard-list-item">
                    <span className="item-title">{event.title}</span>
                    <span className="item-subtitle">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : <div className="empty-section">No upcoming events.</div>}
            </AccordionItem>

            {dashboardData.career_tip && (
              <div className="career-tip-card">
                <div className="career-tip-header">
                  <FiSun />
                  <span>Career Tip of the Day</span>
                </div>
                <p className="career-tip-text">
                  {dashboardData.career_tip.tip_text}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;





