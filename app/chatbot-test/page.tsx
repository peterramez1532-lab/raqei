"use client";

import { useState } from "react";

export default function ChatbotTestPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    console.log("SEND CLICKED");

    if (!message.trim()) {
      setResponse("اكتب رسالة الأول");
      return;
    }

    setLoading(true);
    setResponse("جاري الإرسال...");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("CHATBOT RESPONSE:", data);

      if (!response.ok) {
        setResponse(
          data?.message ||
            data?.error ||
            "حصل خطأ في الـ API"
        );
        return;
      }

      setResponse(
        data?.message ||
          JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error("CHATBOT TEST ERROR:", error);

      setResponse(
        "حصل خطأ أثناء الاتصال بالـ chatbot."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minBlockSize: "100vh",
        padding: "40px",
        background: "#f8f7f4",
        color: "#111",
      }}
    >
      <div
        style={{
          maxInlineSize: "700px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBlockEnd: "30px",
          }}
        >
          RAQEI Chatbot Test
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "stretch",
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(event) => {
              console.log(
                "INPUT:",
                event.target.value
              );

              setMessage(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="اكتب سؤالك هنا..."
            style={{
              flex: 1,
              blockSize: "50px",
              padding: "0 15px",
              border: "1px solid #999",
              borderRadius: "8px",
              background: "#fff",
              color: "#111",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
            style={{
              blockSize: "50px",
              padding: "0 25px",
              border: "none",
              borderRadius: "8px",
              background: "#111",
              color: "#fff",
              fontSize: "16px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading ? "جاري..." : "Send"}
          </button>
        </div>

        <div
          style={{
            marginBlockStart: "30px",
            padding: "20px",
            minBlockSize: "100px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
          }}
        >
          {response || "الرد هيظهر هنا..."}
        </div>
      </div>
    </div>
  );
}