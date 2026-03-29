import { useMentionInput } from "../../../hooks/useMentionInput";
import { MentionDropdown } from "./MentionDropdown";

export function MentionInputField({
  value,
  onChange,
  followingList,
  placeholder,
  className,
  onSubmit,
}) {
  const { inputRef, showMentions, mentionIndex, filteredUsers, handleChange, handleKeyDown, insertMention } =
    useMentionInput({ value, onChange, followingList, onSubmit });

  return (
    <div className="relative flex-1 z-[9999]">
      <input
        ref={inputRef}
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
        />
      )}
    </div>
  );
}