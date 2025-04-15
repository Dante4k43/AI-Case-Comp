import React, { useState, useEffect } from "react";
import TranslationService from "../services/translationService";

const ChatInterface = ({ userLocation }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const welcome = TranslationService.translate("How can I help you find food resources today?");
    setMessages([{ sender: "bot", text: welcome }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const detectedLang = TranslationService.detectLanguage(userText);
    TranslationService.setLanguage(detectedLang);

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");

    const isFoodQuery = /food|bank|pantry|closest|nearby|zip|code|find|help/i.test(userText);
    const endpoint = isFoodQuery ? "/api/chat" : "/api/openai-chat";

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          location: userLocation,
        }),
      });

      const data = await response.json();
      const reply = data.response || TranslationService.translate("Sorry, I had trouble processing your request. Please try again.");
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: TranslationService.translate("Sorry, I had trouble processing your request. Please try again."),
        },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages" style={{ height: "300px", overflowY: "scroll", backgroundColor: "#f9f9f9", padding: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "5px" }}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input" style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={TranslationService.translate("Ask about food resources...")}
          style={{ flexGrow: 1, padding: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;