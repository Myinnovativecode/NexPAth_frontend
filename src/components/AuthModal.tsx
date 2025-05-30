import React, { useState, FormEvent, useEffect } from "react";
import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userId: string, name: string) => void;
  mode: "login" | "signup";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  mode,
}) => {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setIsLogin(mode === "login");
  }, [mode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endpoint = isLogin ? "/login_user" : "/signup_user";
    const payload = isLogin ? { email } : { name, email };

    try {
      const response = await fetch(`http://localhost:8000/auth${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.user_id) {
        onAuthSuccess(data.user_id, data.name);
        // onAuthSuccess(Number(data.user_id), data.name);

        onClose(); // Close modal on success
      } else {
        alert(data.detail || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  if (!isOpen) return null;

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

          <button
            type="button"
            className="google-button"
            onClick={() => {
              window.location.href = "http://localhost:8000/auth/google/login";
            }}
          >
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




