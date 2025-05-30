import React, { useState, useEffect } from "react";
import "./UserProfile.css";

interface UserProfileProps {
  userId: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  contact_number: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user profile");

        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserProfile();
  }, [userId]);

  if (loading) return <p>Loading user profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-profile-card">
      <h2>User Profile</h2>
      {userData && (
        <div className="user-info">
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Contact:</strong> {userData.contact_number}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

