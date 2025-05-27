// Sidebar.tsx
import ashaLogo from "../assets/asha-logo.png";
import React from "react";
import "./Sidebar.css";


interface SidebarProps {
  isOpen: boolean;
  onAuthClick: (mode: "login" | "signup") => void;
  userName: string | null;
  onLogout: () => void;
  onProfileClick: () => void;
  setShowJobList: (val: boolean) => void;
  setShowProfile: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onAuthClick,
  userName,
  onLogout,
  onProfileClick,
  setShowJobList,
  setShowProfile,
}) => {
  const handleFindJobs = () => {
    setShowJobList(true);
    setShowProfile(false);
  };

  const handleMentorship = () => {
    setShowJobList(false);
    setShowProfile(false);
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <img src={ashaLogo} alt="Asha Logo" className="sidebar-logo" />
      <ul className="sidebar-menu">
        {userName ? (
          <>
            <li className="welcome-msg">👋 Welcome, {userName}</li>
            <li onClick={onProfileClick}>My Profile</li>
            <li onClick={handleFindJobs}>Find Jobs</li>
            <li onClick={handleMentorship}>Get Mentorship</li>
            <li onClick={onLogout} className="logout-btn">Logout</li>
          </>
        ) : (
          <>
            <li onClick={() => onAuthClick("login")}>Login</li>
            <li onClick={() => onAuthClick("signup")}>Signup</li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;


