import React, { useEffect, useState, useContext } from "react";
import "./App.css";
import { ThemeContext } from './components/ThemeContext'; 
import ProfileSidebar from "./components/ProfileSidebar";
import ChatMain from "./components/ChatMain";
import AuthModal from "./components/AuthModal";
import JobList from "./components/JobList";

import Sidebar from "./components/Sidebar";
import { FiMenu } from 'react-icons/fi';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Wrapper component to access router hooks
const AppContent: React.FC = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<"chat" | "jobs" | "profile">("chat");
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

// AppContent useEffect for reading URL params and localStorage
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const uidFromUrl = params.get("user_id");
  const nameFromUrl = params.get("name");
  const emailFromUrl = params.get("email");

  const storedUser = localStorage.getItem("ashaUser");

  if (uidFromUrl && nameFromUrl && emailFromUrl) {
    const firstName = nameFromUrl.split(" ")[0];
    const userData = { userId: uidFromUrl, name: firstName, email: emailFromUrl };
    localStorage.setItem("ashaUser", JSON.stringify(userData));
    setUserId(uidFromUrl);
    setUserName(firstName);

    // Clean URL so params don’t linger
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (storedUser) {
    const parsed = JSON.parse(storedUser);
    setUserId(parsed.userId);
    setUserName(parsed.name);
  } else {
    // No user—show auth modal shortly
    const timer = setTimeout(() => setAuthModalOpen(true), 800);
    return () => clearTimeout(timer);
  }
}, []);

  // Fix for keeping header elements visible - this will reset position if they get pushed out
  useEffect(() => {
    const fixHeaderElements = () => {
      const headerElements = document.querySelectorAll('.hamburger, .header-right-side');
      headerElements.forEach(element => {
        if (element instanceof HTMLElement) {
          // Force a refresh on the header elements
          element.style.visibility = 'visible';
          element.style.opacity = '1';
          element.style.transform = 'none';
        }
      });
    };
    
    // Run immediately and after a delay
    fixHeaderElements();
    const timeoutId = setTimeout(fixHeaderElements, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Updated handleAuthSuccess function
  const handleAuthSuccess = (newUserId: string, name: string, email: string) => {
    const firstName = name.split(" ")[0];
    setUserId(newUserId);
    setUserName(firstName);
    
    // Make sure we always have an email stored
    const userEmail = email || "user@example.com"; // Fallback email if none provided
    
    localStorage.setItem("ashaUser", JSON.stringify({ 
      userId: newUserId, 
      name: firstName,
      email: userEmail
    }));
    
    console.log("Stored user data:", { userId: newUserId, name: firstName, email: userEmail });
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("ashaUser");
    setSelectedPage("chat");
    navigate('/chat');
  };

  const handleNewSession = (newSessionId: string, title: string) => {
    setSessionId(newSessionId);
    console.log(`New session started: ${title} (ID: ${newSessionId})`);
  };

  return (
    <div className={`app-wrapper ${theme === 'dark' ? 'dark-app' : 'light-app'}`}>
      {/* Hamburger Menu */}
      <button className="hamburger" onClick={() => setIsSidebarOpen(prev => !prev)}>
        <FiMenu size={24} />
      </button>

      {userId && (
        <Sidebar
          userId={userId}
          currentSessionId={sessionId}
          onSessionSelect={(selectedId) => {
            setSessionId(selectedId);
            setIsSidebarOpen(false);
          }}
          onNewChat={() => {
            setSessionId(null);
            setIsSidebarOpen(false);
          }}
          className={isSidebarOpen ? "is-open" : ""}
        />
      )}

      <div className="main-app-area">
        <div className="header-right-side">
          {userName ? (
            <ProfileSidebar 
              userName={userName} 
              onLogout={handleLogout} 
            />
          ) : (
            <button onClick={() => handleAuthClick("login")} className="auth-button">Login/Signup</button>
          )}
        </div>

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            mode={authMode}
          />
        )}

        <div className="main-content">
          {userId ? (
            <>
              <Routes>
                <Route path="/jobs" element={<JobList userId={userId} />} />
                <Route path="/mentorship" element={<div>Mentorship Content</div>} />
                <Route path="/chat" element={<ChatMain userId={userId} sessionId={sessionId} onNewSession={handleNewSession} />} />
                <Route path="/" element={<Navigate to="/chat" />} />
              </Routes>
            </>
          ) : (
            <div className="login-prompt">Please login to access the features</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App component that provides Router context
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;


