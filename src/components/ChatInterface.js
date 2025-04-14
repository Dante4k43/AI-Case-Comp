import React, { useState } from 'react';

const ChatInterface = ({ userLocation }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I assist you today?' }
    ]);

    const sendMessage = async () => {
        if (!input.trim()) return;
      
        const userMessage = input.trim();
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
      
        let endpoint = '/api/openai-chat';  // Default to OpenAI
        if (userMessage.toLowerCase().includes('food bank') || userMessage.toLowerCase().includes('closest')) {
          endpoint = '/api/chat';  // Switch to geolocation food bank logic
        }
      
        try {
          const response = await fetch(`http://localhost:5001${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
          });
          const data = await response.json();
          setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
        } catch (error) {
          console.error("Error sending message:", error);
          setMessages(prev => [...prev, { sender: 'bot', text: "Error talking to server." }]);
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