"use client";
import React, { useEffect, useRef, useState } from "react";
import ChatBubble from "./chatbubble";
import styles from "./chatbox.module.css";

type Message = {
  id: string;
  author: "system" | "user";
  text: string;
  createdAt: string;
};

const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "m-1",
      author: "system",
      text: "Ask your doctor something.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const toggleChatbox = () => setIsOpen((v) => !v);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      author: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    setInput("");

    // simulate acknowledgement
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `m-bot-${Date.now()}`,
          author: "system",
          text: "Thanks — your clinician will review and reply soon.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 800);
  };

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.container} data-testid="chatbox" aria-live="polite">
      {/* pass isOpen so bubble can hide itself when expanded */}
      <ChatBubble onClick={toggleChatbox} isOpen={isOpen} />
      {isOpen && (
        <div className={styles.window} role="dialog" aria-label="Chat with your clinician">
          <div className={styles.header}>
            <div className={styles.headerTitle}>Message your doctor</div>
            <button aria-label="Close chat" className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className={styles.messages} ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={m.author === "user" ? styles.msgRowUser : styles.msgRowSystem}>
                <div className={m.author === "user" ? styles.msgUser : styles.msgSystem}>
                  <div className={styles.msgText}>{m.text}</div>
                  <div className={styles.msgTime}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="Write a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className={styles.input}
              aria-label="Type your message"
            />
            <button className={styles.sendBtn} onClick={sendMessage} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;