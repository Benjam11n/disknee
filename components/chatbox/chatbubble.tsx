"use client";
import React from "react";

import styles from "./chatbox.module.css";

interface Props {
  onClick?: () => void;
  isOpen?: boolean;
}

const ChatBubble: React.FC<Props> = ({ onClick, isOpen = false }) => {
  // do not render the bubble when chat is open
  if (isOpen) {
    return null;
  }

  return (
    <button
      className={styles.bubble}
      aria-label="Open chat"
      onClick={onClick}
      title="Chat with your doctor"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export default ChatBubble;
