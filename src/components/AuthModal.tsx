import React, { useState, FormEvent } from "react";
import "./AuthModal.css";

interface AuthModalProps {
  onAuthSuccess: (userId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contact, setContact] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simulate UserID creation
    const userId = "user_" + Math.random().toString(36).substr(2, 9);

    // Here you would send name, email, contact to your backend
    onAuthSuccess(userId);
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <h2>Join Asha AI Chatbot</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>

          <div className="auth-divider">or</div>

          <button type="button" className="google-button">
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;


