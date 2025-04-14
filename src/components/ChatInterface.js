import React, { useState } from 'react';

const ChatInterface = ({ userLocation }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I assist you today?' }
    ]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, location: userLocation })
            });
            const data = await response.json();
            const botMessage = { sender: 'bot', text: data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to chatbot.' }]);
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