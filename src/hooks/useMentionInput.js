import { useState, useRef } from "react";

export function useMentionInput({ value, onChange, followingList, onSubmit }) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef(null);

  const filteredUsers = followingList
    .filter((u) => u.username.toLowerCase().includes(mentionQuery.toLowerCase()))
    .slice(0, 5);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const cursor = e.target.selectionStart;
    setCursorPos(cursor);
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const replaced = textBefore.replace(/@[a-zA-Z0-9_]*$/, `@${username} `);
    onChange(replaced + textAfter);
    setShowMentions(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = replaced.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        insertMention(filteredUsers[mentionIndex].username);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return {
    inputRef,
    showMentions,
    mentionIndex,
    filteredUsers,
    handleChange,
    handleKeyDown,
    insertMention,
  };
}