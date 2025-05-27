
import React, { useState, FormEvent } from "react";
import "./AuthModal.css";

interface AuthModalProps {
  onAuthSuccess: (userId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endpoint = isLogin ? "/login/" : "/signup/";
    const payload = isLogin ? { email } : { name, email };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.user_id) {
        onAuthSuccess(data.user_id);
      } else {
        alert(data.detail || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <h2>{isLogin ? "Login to Asha AI Chatbot" : "Join Asha AI Chatbot"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>

          <div className="auth-divider">or</div>

          <button type="button" className="google-button">
            Continue with Google
          </button>

          <div className="auth-toggle">
            {isLogin ? (
              <p>
                Don’t have an account?{" "}
                <span onClick={() => setIsLogin(false)} className="auth-link">
                  Sign Up
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={() => setIsLogin(true)} className="auth-link">
                  Login
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

