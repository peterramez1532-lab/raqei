"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  image: string | null;
};

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  message: string;
  products?: ChatProduct[];
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      message:
        "أهلًا بيك في RAQEI 🤍\n\nأقدر أساعدك في المنتجات، الأسعار، الخصومات والتوفر.\n\nاسألني براحتك.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      message: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      let data: any = {};

      try {
        const contentType =
          response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          data = await response.json();
        }
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message || "Chatbot request failed"
        );
      }

      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "bot",
        message:
          data?.message ||
          "مش قادر أرد على السؤال ده حاليًا.",
        products: Array.isArray(data?.products)
          ? data.products
          : [],
      };

      setMessages((previous) => [
        ...previous,
        botMessage,
      ]);
    } catch (error) {
      console.error("CHATBOT UI ERROR:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "bot",
          message:
            "حصلت مشكلة بسيطة وأنا بحاول أجيب البيانات. جرّب تاني بعد شوية 🤍",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open RAQEI Chatbot"
          style={{
            position: "fixed",
            insetInlineEnd: "24px",
            insetBlockEnd: "24px",
            inlineSize: "58px",
            blockSize: "58px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#111111",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 9999,
            boxShadow:
              "0 12px 35px rgba(0,0,0,0.18)",
            fontSize: "24px",
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            insetInlineEnd: "24px",
            insetBlockEnd: "24px",
            inlineSize: "380px",
            maxInlineSize: "calc(100vw - 32px)",
            blockSize: "620px",
            maxBlockSize: "calc(100vh - 48px)",
            background: "#F8F7F4",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.20)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 18px",
              background: "#111111",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                }}
              >
                RAQEI
              </div>

              <div
                style={{
                  marginBlockStart: "3px",
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                Product Assistant
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              style={{
                inlineSize: "34px",
                blockSize: "34px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 14px",
            }}
          >
            {messages.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent:
                    item.role === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBlockEnd: "14px",
                }}
              >
                <div
                  style={{
                    maxInlineSize: "88%",
                  }}
                >
                  <div
                    style={{
                      padding: "11px 13px",
                      borderRadius:
                        item.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      background:
                        item.role === "user"
                          ? "#111111"
                          : "#ffffff",
                      color:
                        item.role === "user"
                          ? "#ffffff"
                          : "#111111",
                      border:
                        item.role === "bot"
                          ? "1px solid rgba(0,0,0,0.06)"
                          : "none",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      blockSize: "auto",
                    }}
                  >
                    {item.message}
                  </div>

                  {/* Product Cards */}
                  {item.products &&
                    item.products.length > 0 && (
                      <div
                        style={{
                          marginBlockStart: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {item.products.map(
                          (product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              style={{
                                display: "block",
                                textDecoration:
                                  "none",
                                color: "inherit",
                                background:
                                  "#ffffff",
                                borderRadius:
                                  "14px",
                                overflow: "hidden",
                                border:
                                  "1px solid rgba(0,0,0,0.07)",
                              }}
                            >
                              {product.image && (
                                <div
                                  style={{
                                    width: "100%",
                                    height: "150px",
                                    background:
                                      "#eeeeeb",
                                  }}
                                >
                                  <img
                                    src={
                                      product.image
                                    }
                                    alt={
                                      product.name
                                    }
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit:
                                        "cover",
                                      display:
                                        "block",
                                    }}
                                  />
                                </div>
                              )}

                              <div
                                style={{
                                  padding: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "14px",
                                    fontWeight: 600,
                                    marginBottom:
                                      "7px",
                                  }}
                                >
                                  {product.name}
                                </div>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "8px",
                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize:
                                        "14px",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {product.price.toLocaleString(
                                      "en-US"
                                    )}{" "}
                                    EGP
                                  </span>

                                  {product.comparePrice !==
                                    null &&
                                    product.comparePrice >
                                      product.price && (
                                      <span
                                        style={{
                                          fontSize:
                                            "12px",
                                          color:
                                            "#888888",
                                          textDecoration:
                                            "line-through",
                                        }}
                                      >
                                        {product.comparePrice.toLocaleString(
                                          "en-US"
                                        )}{" "}
                                        EGP
                                      </span>
                                    )}
                                </div>

                                <div
                                  style={{
                                    marginTop:
                                      "7px",
                                    fontSize:
                                      "12px",
                                    color:
                                      product.stock >
                                      0
                                        ? "#666666"
                                        : "#a00000",
                                  }}
                                >
                                  {product.stock >
                                  0
                                    ? "متاح حاليًا"
                                    : "غير متاح حاليًا"}
                                </div>
                              </div>
                            </Link>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-start",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    padding: "11px 14px",
                    borderRadius:
                      "16px 16px 16px 4px",
                    background: "#ffffff",
                    border:
                      "1px solid rgba(0,0,0,0.06)",
                    fontSize: "13px",
                    color: "#666666",
                  }}
                >
                  بيدور في المنتجات...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px",
              background: "#ffffff",
              borderTop:
                "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="اسأل عن منتج..."
                disabled={loading}
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 13px",
                  border:
                    "1px solid #ddddda",
                  borderRadius: "12px",
                  background: "#F8F7F4",
                  color: "#111111",
                  fontSize: "14px",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={
                  loading || !message.trim()
                }
                style={{
                  width: "44px",
                  height: "44px",
                  border: "none",
                  borderRadius: "12px",
                  background:
                    loading || !message.trim()
                      ? "#cccccc"
                      : "#111111",
                  color: "#ffffff",
                  cursor:
                    loading || !message.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "17px",
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}