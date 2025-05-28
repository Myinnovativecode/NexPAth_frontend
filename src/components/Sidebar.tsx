// Sidebar.tsx
import {
  FaUser,
  FaBriefcase,
  FaChalkboardTeacher,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";

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
            <li onClick={onProfileClick}>
              <FaUser style={{ marginRight: "8px" }} /> My Profile
            </li>
            <li onClick={handleFindJobs}>
              <FaBriefcase style={{ marginRight: "8px" }} /> Find Jobs
            </li>
            <li onClick={handleMentorship}>
              <FaChalkboardTeacher style={{ marginRight: "8px" }} /> Get Mentorship
            </li>
            <li onClick={onLogout} className="logout-btn">
              <FaSignOutAlt style={{ marginRight: "8px" }} /> Logout
            </li>
          </>
        ) : (
          <>
            <li onClick={() => onAuthClick("login")}>
              <FaSignInAlt style={{ marginRight: "8px" }} /> Login
            </li>
            <li onClick={() => onAuthClick("signup")}>
              <FaUserPlus style={{ marginRight: "8px" }} /> Signup
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;



