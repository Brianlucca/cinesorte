import { useMentionInput } from "../../../hooks/useMentionInput";
import { MentionDropdown } from "./MentionDropdown";

export function MentionTextarea({
  value,
  onChange,
  followingList,
  placeholder,
  className,
  onFocus,
}) {
  const { inputRef, showMentions, mentionIndex, filteredUsers, handleChange, handleKeyDown, insertMention } =
    useMentionInput({ value, onChange, followingList });

  return (
    <div className="relative w-full z-[9999]">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        maxLength={500}
        className={className}
      />
      {showMentions && filteredUsers.length > 0 && (
        <MentionDropdown
          filteredUsers={filteredUsers}
          mentionIndex={mentionIndex}
          onSelect={insertMention}
        />
      )}
    </div>
  );
}