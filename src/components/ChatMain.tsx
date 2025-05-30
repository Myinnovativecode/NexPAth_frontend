import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './ChatMain.css';
import { FiSend, FiMic } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

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
        })
        .catch(() => {
          setMessages([{ sender: 'bot', text: '⚠️ Unable to load this chat session.' }]);
        });
    } else if (!sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const payload = {
      query: userInput,
      user_id: userId,
    };

    try {
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Bot did not return a valid response.' }]);
      }

      if (!currentSessionId && data.session_id) {
        onNewSession(data.session_id, data.title || userInput);
        setCurrentSessionId(data.session_id);
      }
    } catch (error) {
      console.error("❌ Error from FastAPI:", error);
      setMessages((prev) => [...prev, { sender: 'bot', text: '❌ Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">✨ Empowering Women for Their Dream Careers</div>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
            {msg.sender === 'bot' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {msg.text}
              </ReactMarkdown>
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

      <div className="chat-input-section">
        <input
          type="text"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button onClick={handleMicClick} disabled={isTyping} title="Speak">
          <FiMic size={20} color={isListening ? 'red' : 'white'} />
        </button>
        <button onClick={handleSend} disabled={isTyping || !input.trim()}>
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatMain;


















