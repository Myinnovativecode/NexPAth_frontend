import React, { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import ChatMain from "./components/ChatMain";
import AuthModal from "./components/AuthModal";
import JobList from "./components/JobList";
import UserProfile from "./components/UserProfile";

const App: React.FC = () => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<"chat" | "jobs" | "profile">("chat");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uidFromUrl = params.get("user_id");
    const name = params.get("name");
    const email = params.get("email");

    const storedUser = localStorage.getItem("ashaUser");

    if (uidFromUrl && name && email) {
      const firstName = name.split(" ")[0];
      const newUser = { userId: uidFromUrl, name: firstName, email };
      localStorage.setItem("ashaUser", JSON.stringify(newUser));
      setUserId(uidFromUrl);
      setUserName(firstName);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.userId);
      setUserName(parsed.name);
    } else {
      const timer = setTimeout(() => setAuthModalOpen(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newUserId: string, name: string) => {
    const firstName = name.split(" ")[0];
    setUserId(newUserId);
    setUserName(firstName);
    localStorage.setItem("ashaUser", JSON.stringify({ userId: newUserId, name: firstName }));
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    localStorage.removeItem("ashaUser");
    setSelectedPage("chat");
  };

  const handleNewSession = (newSessionId: string, title: string) => {
    setSessionId(newSessionId);
    console.log(`New session started: ${title} (ID: ${newSessionId})`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={isSidebarOpen}
        userName={userName}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        onSelectPage={setSelectedPage}
      />

      <div className="main-app-area">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? "←" : "☰"}
        </button>

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
            selectedPage === "profile" ? (
              <UserProfile userId={userId} />
            ) : selectedPage === "jobs" ? (
              <JobList userId={userId} />
            ) : (
              <ChatMain
                userId={userId}
                sessionId={sessionId}
                onNewSession={handleNewSession}
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;

















