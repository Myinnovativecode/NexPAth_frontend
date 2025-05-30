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
  onSelectPage: (page: "chat" | "profile" | "jobs") => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onAuthClick,
  userName,
  onLogout,
  onSelectPage,
}) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <img src={ashaLogo} alt="Asha Logo" className="sidebar-logo" />
      <ul className="sidebar-menu">
        {userName ? (
          <>
            <li className="welcome-msg">👋 Welcome, {userName}</li>
            <li onClick={() => onSelectPage("profile")}>
              <FaUser style={{ marginRight: "8px" }} /> My Profile
            </li>
            <li onClick={() => onSelectPage("jobs")}>
              <FaBriefcase style={{ marginRight: "8px" }} /> Find Jobs
            </li>
            <li onClick={() => onSelectPage("chat")}>
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




