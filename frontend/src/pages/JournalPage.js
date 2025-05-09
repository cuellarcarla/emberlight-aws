import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { getCookie } from "../utils/cookies";
import './JournalPage.css';

function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [editingDate, setEditingDate] = useState(null);
  const [currentMood, setCurrentMood] = useState('neutral');
  const textareaRef = useRef(null);
  // Calendar variables
  const [selectedDate, setSelectedDate] = useState(null);

  // Get current week dates. Monday to Sunday
  const getWeekDates = () => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  };

  // Fetch entries
  useEffect(() => {
    if (!user) return;
    
    const fetchEntries = async () => {
      try {
        const response = await fetch(`http://localhost:8000/journal/entries/`, {
            credentials: 'include',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            });
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };
    
    fetchEntries();
  }, [user]);

  // Handle save/update
  const handleSave = async (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const text = textareaRef.current?.value || '';
    const existingEntry = entries.find(e => e.date === dateStr);
    
    try {
      let url, method;
      
      if (existingEntry) {
        url = `http://localhost:8000/journal/entries/${existingEntry.id}/`;
        method = 'PUT';
      } else {
        url = 'http://localhost:8000/journal/entries/';
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          date: dateStr,
          mood: currentMood,
          text,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedEntry = await response.json();
      setEntries(prev => 
        existingEntry
          ? prev.map(e => e.id === savedEntry.id ? savedEntry : e)
          : [savedEntry, ...prev]
      );
      setEditingDate(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  // Start editing an entry
  const startEditing = (date, entry) => {
    setEditingDate(date.toISOString().split('T')[0]);
    setCurrentMood(entry?.mood || 'neutral');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Color calendar tiles based on mood
  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    return entry ? `calendar-day-${entry.mood}` : '';
  };

  // Get entry for selected date
  const selectedEntry = selectedDate 
    ? entries.find(e => e.date === selectedDate.toISOString().split('T')[0])
    : null;

  return (
    <div className="journal-container">
      <h2>My Journal</h2>
      
      <div className="view-toggle">
        <button 
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Week View
        </button>
        <button 
          className={viewMode === 'calendar' ? 'active' : ''}
          onClick={() => setViewMode('calendar')}
        >
          Calendar
        </button>
      </div>
      
      {viewMode === 'week' ? (
        <div className="sticky-notes-container">
          {getWeekDates().map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const entry = entries.find(e => e.date === dateStr);
            const isEditing = editingDate === dateStr;
            
            return (
              <div 
                key={dateStr} 
                className={`sticky-note ${entry ? entry.mood : 'empty'}`}
              >
                <div className="sticky-header">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  <div className="sticky-date">{date.getDate()}</div>
                </div>
                
                {isEditing ? (
                  <div className="sticky-edit">
                    <textarea
                      ref={textareaRef}
                      defaultValue={entry?.text || ''}
                      placeholder="Write your thoughts here..."
                    />
                    <div className="mood-selector">
                      {MOODS.map(([value, emoji]) => (
                        <span
                          key={value}
                          className={currentMood === value ? 'selected' : ''}
                          onClick={() => setCurrentMood(value)}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleSave(date)}
                      className="save-button"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="sticky-content">
                    <p>{entry?.text || 'No entry yet'}</p>
                    <button 
                      onClick={() => startEditing(date, entry)}
                      className="edit-button"
                    >
                      {entry ? 'Edit' : 'Add Entry'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="calendar-view">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="journal-calendar"
          />
          
          {selectedEntry && (
            <div className="entry-popup">
              <h4>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
              <div className="entry-mood">Mood: {selectedEntry.mood}</div>
              <div className="entry-text">{selectedEntry.text}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MOODS = [
  ['happy', '😊'],
  ['neutral', '😐'],
  ['sad', '😢'],
  ['angry', '😠'],
  ['anxious', '😰'],
];

export default JournalPage;