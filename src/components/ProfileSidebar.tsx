import React, { useState, useRef, useEffect, useContext } from 'react';
import './ProfileSidebar.css';
import { FaUser, FaBriefcase, FaSignOutAlt, FaHandshake, FaFileAlt } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { IoMoon, IoSunny } from 'react-icons/io5';
import { ThemeContext } from './ThemeContext';
import { Link } from 'react-router-dom';

interface ProfileSidebarProps {
  userName: string;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ userName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const userInitial = userName ? userName.charAt(0).toLowerCase() : '?';
  const isDarkMode = theme === 'dark';
  
  // Get email from localStorage with better error handling
  const userEmail = (() => {
    const storedUser = localStorage.getItem("ashaUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.email || '';
      } catch (error) {
        console.error("Error parsing user data:", error);
        return '';
      }
    }
    return '';
  })();

  // Close the menu if you click outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef]);

  return (
    <div className="profile-sidebar-container" ref={sidebarRef}>
      {/* User Icon Trigger */}
      <button className="profile-icon-button" onClick={() => setIsOpen(!isOpen)}>
        {userInitial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-menu">
          <div className="menu-header">
            <div className="profile-icon-large">{userInitial}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">
                {userEmail || "No email provided"}
              </span>
            </div>
          </div>

          <ul className="menu-list">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Add CV creation logic here
                  setIsOpen(false);
                }}
              >
                <FaFileAlt /> Create CV
              </a>
            </li>
            <li><a href="/find-jobs"><FaBriefcase /> Find Jobs</a></li>
            <li><a href="/mentorship"><FaHandshake /> Get Mentorship</a></li>
          </ul>

          <div className="menu-divider"></div>

          <ul className="menu-list">
            <li><a href="#"><FiMail /> Send feedback</a></li>
          </ul>

          <div className="menu-divider"></div>

          <div className="menu-item-toggle">
            <span>
              {isDarkMode ? <IoMoon /> : <IoSunny />}
              Dark mode
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="menu-divider"></div>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
              setIsOpen(false);
            }}
            className="logout-link"
          >
            <FaSignOutAlt /> Sign out
          </a>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;