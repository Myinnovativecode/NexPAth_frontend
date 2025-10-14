// src/components/ResumeItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ResumeItem.css';
import API_BASE_URL from '../api'; // ✅ Add this import

interface ResumeItemProps {
  id: number;
  fileName: string;
  downloadUrl: string;
  userId: string;
  onDelete: (id: number) => void;
  onRename: (id: number, newName: string) => void;
}

const ResumeItem: React.FC<ResumeItemProps> = ({ 
  id, 
  fileName, 
  downloadUrl, 
  userId,
  onDelete,
  onRename
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(fileName);
  const itemRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`${API_BASE_URL}/resumes/${id}?user_id=${userId}`); // ✅ FIXED!
        onDelete(id);
        setShowContextMenu(false);
      } catch (error) {
        console.error('Failed to delete resume:', error);
        alert('Failed to delete resume. Please try again.');
      }
    }
  };

  const startRenaming = () => {
    setIsRenaming(true);
    setShowContextMenu(false);
  };

// In ResumeItem.tsx

const handleRename = async () => {
    if (newName.trim() === '' || newName.trim() === fileName) {
      setIsRenaming(false);
      return;
    }

    try {
      // FIX: Use URLSearchParams for Form data, which axios sends correctly.
      const body = new URLSearchParams();
      body.append('new_name', newName);

      await axios.patch(`${API_BASE_URL}/resumes/${id}/rename?user_id=${userId}`, body, { // ✅ FIXED!
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });
      onRename(id, newName);
      setIsRenaming(false);
    } catch (error) {
      console.error('Failed to rename resume:', error);
      alert('Failed to rename resume. Please try again.');
      // Revert name on failure
      setNewName(fileName);
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(fileName);
    }
  };

  return (
    <div 
      ref={itemRef}
      className="resume-item" 
      onContextMenu={handleContextMenu}
      data-resume-id={id}
    >
      {isRenaming ? (
        <div className="resume-rename-container">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resume-rename-input"
          />
          <div className="resume-rename-buttons">
            <button onClick={handleRename} className="resume-rename-save">Save</button>
            <button 
              onClick={() => {
                setIsRenaming(false);
                setNewName(fileName);
              }} 
              className="resume-rename-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="resume-link">
            {fileName}
          </a>
          
          {showContextMenu && (
            <div 
              className="resume-context-menu"
              style={{ 
                position: 'fixed',
                left: `${contextMenuPos.x}px`,
                top: `${contextMenuPos.y}px`,
                zIndex: 1000
              }}
            >
              <div className="context-menu-item" onClick={startRenaming}>
                Rename
              </div>
              <div className="context-menu-item delete" onClick={handleDelete}>
                Delete
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeItem;