import React, { useEffect, useState } from "react";
import "./App.css";

import ChatMain from "./components/ChatMain";
import AuthModal from "./components/AuthModal.tsx";

const App: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setTimeout(() => {
        setShowAuthModal(true);
      }, 8000); // Show modal after 1 min if not authenticated
    }
  }, []);

  const handleAuthSuccess = (newUserId: string) => {
    setUserId(newUserId);
    localStorage.setItem("user_id", newUserId);
    setShowAuthModal(false);
  };

  const handleNewSession = (newSessionId: string, title: string) => {
    setSessionId(newSessionId);
    // Optional: store/display the title in a sidebar or session list
    console.log(`New session started: ${title} (ID: ${newSessionId})`);
  };

  return (
    <div className="app-container">
      {/* Branding */}
      <header className="app-header">
        <h1>Asha</h1>
      </header>

      {/* Auth modal */}
      {showAuthModal && <AuthModal onAuthSuccess={handleAuthSuccess} />}

      {/* Main chat area */}
      <main className="main-content">
        {userId && (
          <ChatMain
            userId={userId}
            sessionId={sessionId}
            onNewSession={handleNewSession}
          />
        )}
      </main>
    </div>
  );
};

export default App;











