import { useEffect, useState } from "react";
import { useMentionInput } from "../../../hooks/useMentionInput";
import { MentionDropdown } from "./MentionDropdown";

export function MentionTextarea({
  value,
  onChange,
  followingList,
  placeholder,
  className,
  onFocus,
  maxLength = 500,
  inputRefExternal,
}) {
  const { inputRef, showMentions, mentionIndex, filteredUsers, handleChange, handleKeyDown, insertMention } =
    useMentionInput({ value, onChange, followingList });
  const [anchorRect, setAnchorRect] = useState(null);
  const ref = inputRefExternal || inputRef;

  useEffect(() => {
    if (!showMentions || !ref.current) {
      setAnchorRect(null);
      return undefined;
    }

    const updateRect = () => {
      if (!ref.current) return;
      setAnchorRect(ref.current.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [showMentions, filteredUsers.length, ref]);

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        className={className}
      />
      {showMentions && filteredUsers.length > 0 && (
        <MentionDropdown
          filteredUsers={filteredUsers}
          mentionIndex={mentionIndex}
          onSelect={insertMention}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
}