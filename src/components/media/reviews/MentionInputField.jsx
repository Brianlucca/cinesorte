import { useEffect, useState } from "react";
import { useMentionInput } from "../../../hooks/useMentionInput";
import { MentionDropdown } from "./MentionDropdown";

export function MentionInputField({
  value,
  onChange,
  followingList,
  placeholder,
  className,
  onSubmit,
  inputRefExternal,
}) {
  const { inputRef, showMentions, mentionIndex, filteredUsers, handleChange, handleKeyDown, insertMention } =
    useMentionInput({ value, onChange, followingList, onSubmit });
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
    <div className="relative flex-1">
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
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