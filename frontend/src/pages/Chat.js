import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getCookie } from "../utils/cookies";

function Chat() {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:8000/geminiapi/chat/history", {
          credentials: "include",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
          },
        });
        const data = await res.json();
        setChatHistory(data.chat_history || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/geminiapi/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setChatHistory((prev) => [
          ...prev,
          { message, response: data.response },
        ]);
        setMessage("");
      } else {
        console.error("Error sending message:", data);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Please login to access the chat</h2>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Gemini AI Chat</h2>
      <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
        {chatHistory.map((log, index) => (
          <div key={index}>
            <div className="bg-gray-100 p-2 rounded mb-1">
              <strong>You:</strong> {log.message}
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <strong>AI:</strong> {log.response}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default Chat;