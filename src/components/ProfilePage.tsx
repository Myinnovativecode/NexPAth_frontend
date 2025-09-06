// src/components/ProfilePage.tsx

import React, { useEffect, useState, useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './ProfilePage.css'; // Import correct CSS file
import { FaTimes } from 'react-icons/fa';

interface ProfilePageProps {
  userId: string;
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  contact?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useContext(ThemeContext);
  
  useEffect(() => {
    console.log("ProfilePage mounted with userId:", userId);
    const fetchUserProfile = async () => {
      try {
        // First try to get from localStorage for immediate display
        const storedUser = localStorage.getItem("ashaUser");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          console.log("User data from localStorage:", parsed);
          setUserData({
            name: parsed.name || 'User',
            email: parsed.email || 'user@example.com' // Fallback
          });
        } else {
          console.log("No user data in localStorage");
          setError(true);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Function to get initials for the avatar
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  console.log("Rendering ProfilePage, loading:", loading, "error:", error, "userData:", userData);

  if (loading) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <div className="profile-loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <div className="profile-error">Could not load profile information.</div>
          <button className="close-profile-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
<div className={`profile-overlay parallel-profile-overlay ${theme === 'dark' ? 'dark-theme' : ''}`}>
<div className="profile-card">
        <button className="close-profile-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="profile-header">
          <div className="profile-avatar">{getInitials(userData.name)}</div>
          <h2 className="profile-name">{userData.name}</h2>
        </div>
        
        <div className="profile-email">{userData.email}</div>
        
        {userData.contact && (
          <div className="profile-contact">{userData.contact}</div>
        )}
        
        <button className="edit-profile-btn">Edit Profile</button>
      </div>
    </div>
  );
};

export default ProfilePage;