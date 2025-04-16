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

    // 🔍 Keyword intent detection
    const shouldUseChatEndpoint = /nearest|closest|zip ?code|zipcode|location|find|search|where|map|hours|open now|open today|day|when|available|today|currently|serving|appointment|required|no appointment|walk[- ]?in|walk[- ]?up|delivery|drive[- ]?thru|curbside|distribution|model|format|method|type of food|hot meal|prepared meal|non[- ]?perishable|produce|groceries|fresh|meals|food bank|pantry|resources|support|help|eligibility|id required|photo id|identification|proof of income|proof of address|income verification|zip code check|requirements|documents|transport|transportation|bus|metro|car|drive|ride|friend|family member|pickup|drop off|wraparound|services|child care|childcare|housing|job training|workforce|mental health|health care|benefits|older adults|senior support|financial assistance|case management|legal aid|english classes|esl|referrals|referral|language support|community served|population served|culture|muslim|halal|latino|spanish|vietnamese|ethiopian|korean|chinese|asian|black|african american|minority|immigrant|refugee/i.test(userText);

    const endpoint = shouldUseChatEndpoint ? "/api/chat" : "/api/openai-chat";

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
      <div
        className="chat-messages"
        style={{
          height: "300px",
          overflowY: "scroll",
          backgroundColor: "#1e1e1e",
          padding: "10px",
          color: "#eee",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px",
              backgroundColor: msg.sender === "user" ? "#d14d4d" : "#333",
              color: "#fff",
              padding: "10px",
              borderRadius: "12px",
              maxWidth: "70%",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: msg.text }} />
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
          style={{
            flexGrow: 1,
            padding: "10px",
            backgroundColor: "#222",
            color: "#eee",
            border: "1px solid #444",
            borderRadius: "8px",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            backgroundColor: "#d14d4d",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;