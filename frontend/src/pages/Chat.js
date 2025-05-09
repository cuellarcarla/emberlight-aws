import React, { useEffect, useState } from 'react';
import './Chat.css';

function Chat({ history, loading, onSubmit, message, setMessage }) {
  return (
    <div className="chat-container">
      {history.length === 0 && !loading ? (
        <div className="empty-state">
          <h3>How are you feeling today?</h3>
          <p>Ask Gemini AI Chat anything</p>
        </div>
      ) : (
        <div className="chat-messages">
          {history.map((log, index) => (
            <React.Fragment key={index}>
              <div className="message user-message">
                <div className="message-content">{log.message}</div>
              </div>
              <div className="message ai-message">
                <div className="message-content">{log.response}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={loading || !message.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default Chat;