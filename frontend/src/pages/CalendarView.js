import React from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';

function CalendarView({ entries, selectedDate, setSelectedDate }) {
  const toLocalDateString = date => format(date, 'yyyy-MM-dd');

  const tileClassName = ({ date }) => {
    const entry = entries.find(e => e.date === toLocalDateString(date));
    return entry ? `calendar-day-${entry.mood}` : '';
  };

  const selectedEntry = entries.find(e => e.date === toLocalDateString(selectedDate));

  return (
    <div className="calendar-view">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
        className="journal-calendar"
      />
      {selectedEntry && (
        <div className="entry-popup">
          <h4>{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
          <div className="entry-mood">Mood: {selectedEntry.mood}</div>
          <div className="entry-text">{selectedEntry.text}</div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
