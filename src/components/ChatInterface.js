import React, { useState } from "react";

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    // Decide which endpoint to call
    let endpoint = '/api/openai-chat'; // Default to OpenAI chat

    // Basic keyword detection for food bank queries
    const lower = userMessage.toLowerCase();
    if (
      lower.includes('food') ||
      lower.includes('bank') ||
      lower.includes('find') ||
      lower.includes('closest') ||
      lower.includes('near me')
    ) {
      endpoint = '/api/chat'; // Switch to geolocation logic
    }

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();

      // Handle possible missing response fields gracefully
      if (data.response) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: "Unknown server response." }]);
      }

    } catch (error) {
      console.error("❗ Error sending message:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "❗ Error talking to server." }]);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

    return (
        <div className="chat-interface">
            <div className="chat-messages" style={{ height: '300px', overflowY: 'scroll', backgroundColor: '#f9f9f9', padding: '10px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '5px' }}>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input" style={{ display: 'flex', marginTop: '10px' }}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                    style={{ flexGrow: 1, padding: '10px' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px' }}>Send</button>
            </div>
        </div>
    );
};

export default ChatInterface;