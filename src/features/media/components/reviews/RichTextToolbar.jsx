import { useEffect, useRef, useState } from "react";
import { Bold, EyeOff, Italic, List, MessageSquareQuote, Quote, Smile } from "lucide-react";

const QUICK_EMOJIS = [
  "\u{1F600}",
  "\u{1F602}",
  "\u{1F60D}",
  "\u{1F979}",
  "\u{1F60E}",
  "\u{1F92F}",
  "\u{1F62D}",
  "\u{1F621}",
  "\u{1F525}",
  "\u{1F44F}",
  "\u2764\uFE0F",
  "\u{1F3AC}",
];

const QUICK_TEMPLATES = [
  "Pontos fortes: ",
  "Pontos fracos: ",
  "Vale assistir? ",
  "Melhor cena: ",
  "Destaque: ",
  "Veredito final: ",
];

function wrapSelection(input, before, after = before) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const selected = input.value.slice(start, end) || "texto";
  const nextValue = `${input.value.slice(0, start)}${before}${selected}${after}${input.value.slice(end)}`;
  return {
    nextValue,
    nextSelectionStart: start + before.length,
    nextSelectionEnd: start + before.length + selected.length,
  };
}

function prefixLines(input, prefix) {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? input.value.length;
  const selected = input.value.slice(start, end) || "item";
  const lines = selected.split("\n").map((line) => `${prefix}${line}`);
  const transformed = lines.join("\n");
  const nextValue = `${input.value.slice(0, start)}${transformed}${input.value.slice(end)}`;
  return {
    nextValue,
    nextSelectionStart: start,
    nextSelectionEnd: start + transformed.length,
  };
}

function insertAtCursor(input, insertedText) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue = `${input.value.slice(0, start)}${insertedText}${input.value.slice(end)}`;
  const caret = start + insertedText.length;
  return {
    nextValue,
    nextSelectionStart: caret,
    nextSelectionEnd: caret,
  };
}

const TOOLS = [
  { id: "bold", label: "Negrito", icon: Bold, apply: (input) => wrapSelection(input, "**") },
  { id: "italic", label: "Italico", icon: Italic, apply: (input) => wrapSelection(input, "*") },
  { id: "quote", label: "Citar", icon: Quote, apply: (input) => prefixLines(input, "> ") },
  { id: "list", label: "Lista", icon: List, apply: (input) => prefixLines(input, "- ") },
  { id: "spoiler", label: "Spoiler", icon: EyeOff, apply: (input) => wrapSelection(input, "||") },
];

export default function RichTextToolbar({
  inputRef,
  onChange,
  allowFormatting = true,
  allowEmoji = true,
  allowTemplates = true,
  allowSpoiler = true,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setShowEmojiPicker(false);
        setShowTemplatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTool = (tool) => {
    const input = inputRef?.current;
    if (!input) return;

    const result = tool.apply(input);
    onChange(result.nextValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
    });
  };

  const insertText = (value) => {
    const input = inputRef?.current;
    if (!input) return;

    const result = insertAtCursor(input, value);
    onChange(result.nextValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
    });
  };

  const visibleTools = TOOLS.filter((tool) => (tool.id === "spoiler" ? allowSpoiler : allowFormatting));

  return (
    <div ref={containerRef} className="relative">
      <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20 p-1.5 sm:flex-wrap">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => applyTool(tool)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.035] p-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white sm:px-3"
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}

        {allowEmoji && (
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker((current) => !current);
              setShowTemplatePicker(false);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.035] p-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white sm:px-3"
          >
            <Smile size={14} />
            <span className="hidden sm:inline">Emoji</span>
          </button>
        )}

        {allowTemplates && (
          <button
            type="button"
            onClick={() => {
              setShowTemplatePicker((current) => !current);
              setShowEmojiPicker(false);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.035] p-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white sm:px-3"
          >
            <MessageSquareQuote size={14} />
            <span className="hidden sm:inline">Templates</span>
          </button>
        )}
      </div>

      {allowEmoji && showEmojiPicker && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
          <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">Emojis rapidos</div>
          <div className="grid grid-cols-6 gap-2">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  insertText(emoji);
                  setShowEmojiPicker(false);
                }}
                className="flex h-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-2xl transition-all hover:bg-white/10"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {allowTemplates && showTemplatePicker && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.72)] backdrop-blur-2xl">
          <div className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">Templates curtos</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK_TEMPLATES.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  insertText(template);
                  setShowTemplatePicker(false);
                }}
                className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-zinc-200 transition-all hover:bg-white/10 hover:text-white"
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
