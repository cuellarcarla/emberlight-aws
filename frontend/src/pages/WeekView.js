import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';

const MOODS = [
  ['happy', '😊'],
  ['neutral', '😐'],
  ['sad', '😢'],
  ['angry', '😠'],
  ['anxious', '😰'],
];

function WeekView({ entries, weekDates, editingDate, currentMood, setCurrentMood, handleSave, startEditing }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editingDate) {
      textareaRef.current?.focus();
    }
  }, [editingDate]);

  const toLocalDateString = date => format(date, 'yyyy-MM-dd');

  return (
    <div className="sticky-notes-container">
      {weekDates.map((date) => {
        const dateStr = toLocalDateString(date);
        const entry = entries.find(e => e.date === dateStr);
        const isEditing = editingDate === dateStr;

        return (
          <div key={dateStr} className={`sticky-note ${entry ? entry.mood : 'empty'}`}>
            <div className="sticky-header" style={{ color: "#5F7F71" }}>
              {date.toLocaleDateString('en-US', { weekday: 'long' })}
              <div className="sticky-date" style={{ color: "#5F7F71" }}>{date.getDate()}</div>
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
                <button onClick={() => handleSave(date)} className="save-button">Save</button>
              </div>
            ) : (
              <div className="sticky-content">
                <p>{entry?.text || 'No entry yet'}</p>
                <button onClick={() => startEditing(date, entry)} className="edit-button">
                  {entry ? 'Edit' : 'Add Entry'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeekView;
