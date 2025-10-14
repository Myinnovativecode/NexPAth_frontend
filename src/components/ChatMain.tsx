import API_BASE_URL from '../api'; // Add this import at the top
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './ChatMain.css';
import axios from 'axios'; // Add this import
import { FiSend, FiMic } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import JobCard from './JobCard';
import ResumeBuilder from './ResumeBuilder'; // Import the ResumeBuilder component



interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  jobResults?: Array<{
    title: string;
    company: string;
    city: string;
    description: string;
    salary_range?: string;
    employment_type?: string;
    posted_at?: string;
    apply_link: string;
    employer_website?: string;
    employer_logo?: string;
  }>;
}

interface ChatMainProps {
  userId: string;
  sessionId: string | null;
  onNewSession: (sessionId: string, title: string) => void;
}

// Cache the SpeechRecognition constructor once to avoid re-evaluation
const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

const ChatMain: React.FC<ChatMainProps> = ({ userId, sessionId, onNewSession }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [jobResults, setJobResults] = useState([]);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [resumeBuilderMode, setResumeBuilderMode] = useState<'create' | 'update'>('create');



  // --------------------------------------------------------------------
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0);
  const [headings, setHeadings] = useState([
    {
      text: 'Resume Building Help',
      link: '/resume-building' // Replace with your actual link
    },
    {
      text: 'Upcoming Events',
      link: '/upcoming-events'  // Replace with your actual link
    },
    {
      text: 'Live Job Updates',
      link: '/live-job-updates' // Replace with your actual link
    }
  ]);

      



  useEffect(() => {
    const fetchHeadings = async () => {
      try {
        const response = await fetch('http://localhost:8000/headings'); // Replace with your API endpoint
        const data = await response.json();
        setHeadings(data);
      } catch (error) {
        console.error("Error fetching headings:", error);
        // Handle error appropriately (e.g., display a default heading)
      }
    };

    fetchHeadings();

    const intervalId = setInterval(() => {
      setCurrentHeadingIndex((prevIndex) => (prevIndex + 1) % headings.length);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // ----------------------------------------------------------------------
  const scrollToBottom = () => {
    if (!chatBodyRef.current || !chatEndRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (atBottom) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      fetch(`http://localhost:8000/chat/session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          const msgs: Message[] = data.messages.map((msg: any) => ({
            sender: msg.sender,
            text: msg.message,
          }));
          setMessages(msgs);
          setCurrentSessionId(sessionId);
          // Set conversation started if there are messages
          if (msgs.length > 0) {
            setConversationStarted(true);
          }
        })
        .catch(() => {
          setMessages([{ sender: 'bot', text: '⚠️ Unable to load this chat session.' }]);
          setConversationStarted(true);
        });
    } else if (!sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
      setConversationStarted(false); // Reset when starting a new chat
    }
  }, [sessionId]);

const handleSend = async () => {
  if (!input.trim()) return;
  const userMessage: Message = { sender: 'user', text: input };
  const userInput = input;
  setMessages((prev) => [...prev, userMessage]);
  setInput('');
  setIsTyping(true);
  setConversationStarted(true);

  if (inputRef.current) {
    inputRef.current.style.height = 'auto';
  }

  const payload = {
    query: userInput,
    user_id: userId,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.response) {
      // Handle job results
      if (data.job_results && Array.isArray(data.job_results)) {
        setMessages((prev) => [
          ...prev, 
          { 
            sender: 'bot', 
            text: data.response,
            jobResults: data.job_results 
          }
        ]);
      } 
      // Handle resume builder action
      else if (data.action === 'open_resume_form') {
        setShowResumeBuilder(true);
        setResumeBuilderMode('create');
        setMessages((prev) => [
          ...prev, 
          { 
            sender: 'bot', 
            text: data.response 
          }
        ]);
      }
      else {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      }
    } else {
      setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Bot did not return a valid response.' }]);
    }

    if (!currentSessionId && data.session_id) {
      onNewSession(data.session_id, data.title || userInput);
      setCurrentSessionId(data.session_id);
    }
  } catch (error) {
    console.error("❌ Error from FastAPI:", error);
    setMessages((prev) => [...prev, { sender: 'bot', text: '❌ There was an issue. Please try again later.' }]);
  } finally {
    setIsTyping(false);
  }
};


const handleResumeComplete = async (data: { download_url: string, resume_id?: number }) => {
  try {
    // Add resume to messages
    setMessages((prev) => [
      ...prev, 
      { 
        sender: 'bot', 
        text: `Your resume is ready! Download it here: [Resume Download](${data.download_url})` 
      }
    ]);

    // Optional: Fetch and display resume details
    if (data.resume_id) {
      const resumeDetails = await axios.get(`/resumes/${data.resume_id}`);
      // You can add more detailed message or store resume info
    }

    // Close resume builder
    setShowResumeBuilder(false);
  } catch (error) {
    console.error('Resume completion error:', error);
    setMessages((prev) => [
      ...prev, 
      { 
        sender: 'bot', 
        text: '⚠️ There was an issue processing your resume. Please try again.' 
      }
    ]);
  }
};

  // Auto-resize textarea as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🎤 Voice recognition setup
  const handleMicClick = () => {
    if (!SpeechRecognitionConstructor) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Function to start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setConversationStarted(false);
    // You might want to call an API to create a new session
  };

  return (
    <div className="chat-container">
      {/* Show slogan only when conversation hasn't started */}
      
       {showResumeBuilder && (
      <div className="resume-builder-overlay">
        <div className="resume-builder-container">
          <button 
            className="close-resume-builder"
            onClick={() => setShowResumeBuilder(false)}
          >
            ✕
          </button>
          <ResumeBuilder 
            userId={userId} 
            mode={resumeBuilderMode}
            onComplete={handleResumeComplete}
            onCancel={() => setShowResumeBuilder(false)}
          />
        </div>
      </div>
    )}
      
      {!conversationStarted && (
        <div className="chat-welcome">
          <h1 className="chat-title">Your AI Ally for Jobs, Growth & Guidance</h1>
          <div className="input-container-initial">
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                placeholder="Ask anything..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                rows={1}
                className="modern-input"
              />
              <button
                onClick={handleMicClick}
                disabled={isTyping}
                className={`input-icon-button modern-mic-button ${isListening ? 'listening' : ''}`}
                aria-label="Voice input"
              >
                <FiMic size={20} />
              </button>
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="input-icon-button modern-send-button"
                aria-label="Send message"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Messages area */}
      <div className={`chat-body ${!conversationStarted ? 'empty-chat' : ''}`} ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
            {msg.sender === 'bot' ? (
              <>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.text}
                </ReactMarkdown>
                {msg.jobResults && msg.jobResults.length > 0 && (
                  <div className="job-results-container">
                    {msg.jobResults.map((job, jobIndex) => (
                      <JobCard key={jobIndex} job={job} userId={userId} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <span>Asha is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* New styled input container */}
      {conversationStarted && (
        <div className="modern-input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              placeholder="Ask for job tips, mentorship, or growth..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              rows={1}
              className="modern-input"
            />
            <button
              onClick={handleMicClick}
              disabled={isTyping}
              className={`input-icon-button modern-mic-button ${isListening ? 'listening' : ''}`}
              aria-label="Voice input"
            >
              <FiMic size={20} />
            </button>
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="input-icon-button modern-send-button"
              aria-label="Send message"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
        
      )}
    </div>
  );
};

export default ChatMain;