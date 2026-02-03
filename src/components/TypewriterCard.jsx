import { useEffect, useMemo, useRef, useState } from "react";

const FONT_SIZES = [
  { label: "10", value: "10" },
  { label: "12", value: "12" },
  { label: "14", value: "14" },
  { label: "16", value: "16" },
  { label: "18", value: "18" },
  { label: "20", value: "20" },
  { label: "24", value: "24" },
  { label: "28", value: "28" },
  { label: "32", value: "32" },
  { label: "36", value: "36" },
  { label: "40", value: "40" },
  { label: "44", value: "44" },
  { label: "48", value: "48" },
  { label: "50", value: "50" },
];

const TypewriterCard = ({ fontValue, onFontChange, language }) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(FONT_SIZES[1].value);
  const [stylePreset, setStylePreset] = useState(
    language.stylePresets[0].value
  );
  const [inputBuffer, setInputBuffer] = useState("");
  const [suggestionItems, setSuggestionItems] = useState([]);
  const [suggestionAnchor, setSuggestionAnchor] = useState(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [activeColor, setActiveColor] = useState("#000000");
  const editorRef = useRef(null);
  const pageRef = useRef(null);
  const activeWordRangeRef = useRef(null);
  const inputBufferRef = useRef("");
  const selectionRef = useRef(null);

  const ensureFocus = () => {
    editorRef.current?.focus();
  };

  const escapeHtml = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const formatText = (text) => {
    const safeText = escapeHtml(text);
    const hasFormat =
      activeFormats.bold ||
      activeFormats.italic ||
      activeFormats.underline ||
      activeColor !== "#000000";
    if (!hasFormat) return safeText;
    const styles = [];
    if (activeFormats.bold) styles.push("font-weight:700");
    if (activeFormats.italic) styles.push("font-style:italic");
    if (activeFormats.underline) styles.push("text-decoration:underline");
    if (activeColor !== "#000000") styles.push(`color:${activeColor}`);
    return `<span style="${styles.join(";")}">${safeText}</span>`;
  };

  const insertText = (text) => {
    document.execCommand("insertHTML", false, formatText(text));
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const ensureSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    if (selectionRef.current) return;
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    selectionRef.current = range.cloneRange();
  };

  const getPrimaryFontName = (fontFamily) => {
    if (!fontFamily) return "Noto Sans Telugu";
    const match = fontFamily.match(/"([^"]+)"|([^,]+)/);
    return (match?.[1] || match?.[2] || "Noto Sans Telugu").trim();
  };

  const toRtf = (plainText, fontName, sizePx) => {
    const fontSizeHalfPoints = Math.max(8, Math.round(sizePx * 2));
    const escaped = [];
    for (const ch of plainText) {
      const code = ch.codePointAt(0);
      if (ch === "\\") {
        escaped.push("\\\\");
      } else if (ch === "{") {
        escaped.push("\\{");
      } else if (ch === "}") {
        escaped.push("\\}");
      } else if (ch === "\n") {
        escaped.push("\\par ");
      } else if (ch === "\t") {
        escaped.push("\\tab ");
      } else if (code <= 127) {
        escaped.push(ch);
      } else {
        escaped.push(`\\u${code}?`);
      }
    }
    return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil ${fontName};}}\\uc1\\fs${fontSizeHalfPoints} ${escaped.join("")}}`;
  };

  const handleCopy = async () => {
    const editor = editorRef.current;
    const text = editor?.innerText?.trim();
    if (!text) return;
    const htmlBody = editor?.innerHTML || "";
    const html = `<div style="font-family:${fontValue}; font-size:${fontSize}px;">${htmlBody}</div>`;
    const primaryFont = getPrimaryFontName(fontValue);
    const rtf = toRtf(text, primaryFont, Number(fontSize));
    try {
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
            "text/rtf": new Blob([rtf], { type: "text/rtf" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setCopied(false);
    ensureFocus();
  };

  const handleToolbarMouseDown = (event) => {
    event.preventDefault();
    saveSelection();
  };

  const updateCurrentWordRange = (transliteratedWord) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const caretRange = selection.getRangeAt(0);
    const container = caretRange.startContainer;
    if (!container || container.nodeType !== Node.TEXT_NODE) return;
    const startOffset = caretRange.startOffset - transliteratedWord.length;
    if (startOffset < 0) return;
    const range = document.createRange();
    range.setStart(container, startOffset);
    range.setEnd(container, caretRange.startOffset);
    activeWordRangeRef.current = range;
  };

  const replaceCurrentWord = (transliteratedWord) => {
    const selection = window.getSelection();
    if (!selection) return;
    const range = activeWordRangeRef.current;
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    insertText(transliteratedWord);
    updateCurrentWordRange(transliteratedWord);
  };

  const handleBeforeInput = (event) => {
    const { inputType, data } = event.nativeEvent;
    if (inputType === "insertParagraph" || inputType === "insertLineBreak") {
      inputBufferRef.current = "";
      setInputBuffer("");
      setSuggestionItems([]);
      activeWordRangeRef.current = null;
      setSuggestionAnchor(null);
      return;
    }

    if (inputType !== "insertText" || !data) return;

    if (language.isInputChar(data)) {
      event.preventDefault();
      ensureFocus();
      inputBufferRef.current += data;
      const transliteratedWord = language.transliterate(inputBufferRef.current);
      replaceCurrentWord(transliteratedWord);
      setInputBuffer(inputBufferRef.current);
      requestAnimationFrame(updateSuggestionPosition);
      return;
    }

    inputBufferRef.current = "";
    setInputBuffer("");
    setSuggestionItems([]);
    activeWordRangeRef.current = null;
    setSuggestionAnchor(null);
  };

  const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText) return;
    event.preventDefault();
    ensureFocus();
    insertText(language.transliterate(pastedText));
    setInputBuffer("");
    setSuggestionItems([]);
    activeWordRangeRef.current = null;
    setSuggestionAnchor(null);
    inputBufferRef.current = "";
  };

  const runCommand = (command, value = null) => {
    ensureFocus();
    ensureSelection();
    if (selectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
    if (command === "foreColor") {
      document.execCommand("styleWithCSS", false, true);
    }
    document.execCommand(command, false, value);
    if (
      command === "insertUnorderedList" ||
      command === "insertOrderedList"
    ) {
      const isActive = document.queryCommandState(command);
      if (!isActive) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount) {
          const range = selection.getRangeAt(0);
          const list = document.createElement(
            command === "insertOrderedList" ? "ol" : "ul"
          );
          const item = document.createElement("li");
          item.appendChild(document.createElement("br"));
          list.appendChild(item);
          range.insertNode(list);
          range.setStart(item, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    saveSelection();
  };

  const toggleInlineFormat = (format) => {
    ensureFocus();
    ensureSelection();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      document.execCommand(format, false, null);
      saveSelection();
      return;
    }
    setActiveFormats((prev) => ({
      ...prev,
      [format]: !prev[format],
    }));
  };

  const applyInlineColor = (color) => {
    setActiveColor(color);
    ensureFocus();
    ensureSelection();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      document.execCommand("styleWithCSS", false, true);
      document.execCommand("foreColor", false, color);
      saveSelection();
    }
  };

  const applySuggestion = (suggestion) => {
    const range = activeWordRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
    insertText(suggestion);
    updateCurrentWordRange(suggestion);
    setInputBuffer("");
    setSuggestionItems([]);
    activeWordRangeRef.current = null;
    setSuggestionAnchor(null);
    inputBufferRef.current = "";
  };

  const updateSuggestionPosition = () => {
    const editor = editorRef.current;
    const page = pageRef.current;
    const selection = window.getSelection();
    if (!editor || !page || !selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return;
    selectionRef.current = range.cloneRange();
    const rect = range.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      setSuggestionAnchor(null);
      return;
    }
    setSuggestionAnchor({
      left: rect.left - pageRect.left,
      top: rect.bottom - pageRect.top + 8,
    });
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        toggleInlineFormat("bold");
        return;
      }
      if (key === "i") {
        event.preventDefault();
        toggleInlineFormat("italic");
        return;
      }
      if (key === "u") {
        event.preventDefault();
        toggleInlineFormat("underline");
        return;
      }
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        runCommand("undo");
        return;
      }
      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        runCommand("redo");
        return;
      }
    }

    if (language.isInputChar(event.key) && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      inputBufferRef.current += event.key;
      const transliteratedWord = language.transliterate(inputBufferRef.current);
      replaceCurrentWord(transliteratedWord);
      setInputBuffer(inputBufferRef.current);
      requestAnimationFrame(updateSuggestionPosition);
      return;
    }

    if (event.key === "Enter" && suggestionItems.length > 0) {
      event.preventDefault();
      applySuggestion(suggestionItems[0]);
      return;
    }

    if (
      event.key === " " ||
      event.key === "Enter" ||
      event.key === "Escape" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown"
    ) {
      inputBufferRef.current = "";
      setInputBuffer("");
      setSuggestionItems([]);
      activeWordRangeRef.current = null;
      setSuggestionAnchor(null);
      if (event.key === "Escape") {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Backspace" && inputBufferRef.current.length > 0) {
      event.preventDefault();
      inputBufferRef.current = inputBufferRef.current.slice(0, -1);
      const nextWord = inputBufferRef.current;
      if (!nextWord) {
        if (activeWordRangeRef.current) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(activeWordRangeRef.current);
          document.execCommand("delete", false);
        }
        activeWordRangeRef.current = null;
        setInputBuffer("");
        setSuggestionItems([]);
        setSuggestionAnchor(null);
        return;
      }
      replaceCurrentWord(language.transliterate(nextWord));
      setInputBuffer(nextWord);
      requestAnimationFrame(updateSuggestionPosition);
      return;
    }

    if (!suggestionItems.length) return;
    const index = Number.parseInt(event.key, 10);
    if (Number.isNaN(index)) return;
    const suggestion = suggestionItems[index - 1];
    if (!suggestion) return;
    event.preventDefault();
    applySuggestion(suggestion);
  };

  useEffect(() => {
    if (!inputBuffer || inputBuffer.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        if (!language.getSuggestions) return;
        const items = await language.getSuggestions(
          inputBuffer,
          controller.signal
        );
        setSuggestionItems(items.slice(0, language.suggestionLimit || 6));
      } catch (error) {
        setSuggestionItems([]);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [inputBuffer, language]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (!editor.contains(range.startContainer)) return;
      selectionRef.current = range.cloneRange();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (!suggestionItems.length) {
      setSuggestionAnchor(null);
      return;
    }
    updateSuggestionPosition();
  }, [suggestionItems]);

  const editorStyle = useMemo(
    () => ({
      fontFamily: fontValue,
      fontSize: `${fontSize}px`,
    }),
    [fontSize, fontValue]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition dark:border-slate-900 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={fontValue}
            onChange={(event) => onFontChange(event.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {language.fonts.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{ fontFamily: option.value }}
              >
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value)}
            className="h-9 w-20 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          <select
            value={stylePreset}
            onChange={(event) => setStylePreset(event.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {language.stylePresets.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            onClick={() => toggleInlineFormat("bold")}
            onMouseDown={handleToolbarMouseDown}
            className={`rounded-md border px-2 py-1 text-xs font-semibold shadow-sm transition ${
              activeFormats.bold
                ? "border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => toggleInlineFormat("italic")}
            onMouseDown={handleToolbarMouseDown}
            className={`rounded-md border px-2 py-1 text-xs italic shadow-sm transition ${
              activeFormats.italic
                ? "border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => toggleInlineFormat("underline")}
            onMouseDown={handleToolbarMouseDown}
            className={`rounded-md border px-2 py-1 text-xs underline shadow-sm transition ${
              activeFormats.underline
                ? "border-slate-400 bg-slate-200 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => runCommand("justifyLeft")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => runCommand("justifyCenter")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => runCommand("justifyRight")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Right
          </button>
          <button
            type="button"
            onClick={() => runCommand("insertUnorderedList")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={() => runCommand("insertOrderedList")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Numbered
          </button>
          <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Color
            <input
              type="color"
              aria-label="Text color"
              onMouseDown={handleToolbarMouseDown}
              onChange={(event) => applyInlineColor(event.target.value)}
              className="h-5 w-5 cursor-pointer rounded-full border border-slate-200 bg-transparent p-0"
              value={activeColor}
            />
          </label>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <button
            type="button"
            onClick={() => runCommand("undo")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label="Undo"
            title="Undo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h6a7 7 0 1 1 0 14h-1" />
              <path d="M3 7l4-4" />
              <path d="M3 7l4 4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => runCommand("redo")}
            onMouseDown={handleToolbarMouseDown}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label="Redo"
            title="Redo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7h-6a7 7 0 1 0 0 14h1" />
              <path d="M21 7l-4-4" />
              <path d="M21 7l-4 4" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              aria-label="Clear"
              title="Clear"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6l1-2h6l1 2" />
                <path d="M8 10v8" />
                <path d="M12 10v8" />
                <path d="M16 10v8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              aria-label="Copy"
              title="Copy"
            >
              {copied ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-100 px-4 py-4 dark:bg-slate-950">
        <div ref={pageRef} className="relative w-full">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onBeforeInput={handleBeforeInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onInput={saveSelection}
            onClick={updateSuggestionPosition}
            onKeyUp={updateSuggestionPosition}
            onMouseUp={updateSuggestionPosition}
            onFocus={saveSelection}
            onBlur={saveSelection}
            spellCheck={false}
            data-placeholder={language.placeholder}
            className={`typewriter-input min-h-[520px] w-full whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-white px-6 py-6 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-slate-600 dark:focus:ring-slate-800 style-${stylePreset}`}
            style={editorStyle}
          />
          {suggestionItems.length > 0 && suggestionAnchor ? (
            <div
              className="absolute z-20 w-56 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              style={{
                left: suggestionAnchor.left,
                top: suggestionAnchor.top,
              }}
            >
              <ol className="space-y-1">
                {suggestionItems.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(item)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="w-4 text-[10px] text-slate-400">
                        {index + 1}.
                      </span>
                      <span className="text-sm">{item}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default TypewriterCard;
