import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { getCookie } from "../utils/cookies";
import './JournalPage.css';
import WeekView from './WeekView';
import CalendarView from './CalendarView';

function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('week');
  const [editingDate, setEditingDate] = useState(null);
  const [currentMood, setCurrentMood] = useState('neutral');

  const getWeekDates = () => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 }); // Return the start of a week for the given date, week starts on Monday
    return Array.from({ length: 7 }, (_, dayIndex) => addDays(monday, dayIndex));
  };

  const toLocalDateString = date => format(date, 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      try {
        const response = await fetch(`http://localhost:8000/journal/entries/`, {
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
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

  const handleSave = async (date) => {
    const dateStr = toLocalDateString(date);
    const textarea = document.querySelector(`textarea[data-date="${dateStr}"]`);
    const text = textarea?.value || '';
    const existingEntry = entries.find(e => e.date === dateStr);

    const url = existingEntry
      ? `http://localhost:8000/journal/entries/${existingEntry.id}/`
      : 'http://localhost:8000/journal/entries/';
    const method = existingEntry ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({ date: dateStr, mood: currentMood, text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedEntry = await response.json();

      setEntries(prev =>
        existingEntry
          ? prev.map(e => (e.id === savedEntry.id ? savedEntry : e))
          : [savedEntry, ...prev]
      );

      setEditingDate(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const startEditing = (date, entry) => {
    setEditingDate(format(date, 'yyyy-MM-dd'));
    setCurrentMood(entry?.mood || 'neutral');
  };

  return (
    <div className="journal-container">
      <h1 style={{ color: "#2F5D46" }}>Pensamientos Semanales</h1>

      <div className="view-toggle">
        <button 
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Semanal
        </button>
        <button 
          className={viewMode === 'calendar' ? 'active' : ''}
          onClick={() => setViewMode('calendar')}
        >
          Calendario
        </button>
      </div>

      {viewMode === 'week' && (
        <WeekView
          entries={entries}
          weekDates={getWeekDates()}
          editingDate={editingDate}
          currentMood={currentMood}
          setCurrentMood={setCurrentMood}
          handleSave={handleSave}
          startEditing={startEditing}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          entries={entries}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
    </div>
  );
}

export default JournalPage;
