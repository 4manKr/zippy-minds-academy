"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered, Heading2, Minus,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
  minHeight = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipSync  = useRef(false);

  // Initialise editor content only on mount
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value ?? "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. modal open with different course)
  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return; }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value ?? "";
    }
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    skipSync.current = true;
    onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const handleInput = useCallback(() => {
    skipSync.current = true;
    onChange(editorRef.current?.innerHTML ?? "");
  }, [onChange]);

  const toolbarBtn = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    title: string,
  ) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors shrink-0"
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant/60 bg-surface-container flex-wrap">
        {toolbarBtn("bold",    <Bold size={13} />,        () => exec("bold"),           "Bold (Ctrl+B)")}
        {toolbarBtn("italic",  <Italic size={13} />,      () => exec("italic"),         "Italic (Ctrl+I)")}
        {toolbarBtn("under",   <Underline size={13} />,   () => exec("underline"),      "Underline (Ctrl+U)")}
        <div className="w-px h-4 bg-outline-variant mx-1" />
        {toolbarBtn("h3",      <Heading2 size={13} />,    () => exec("formatBlock", "<h3>"), "Heading")}
        {toolbarBtn("ul",      <List size={13} />,        () => exec("insertUnorderedList"),   "Bullet list")}
        {toolbarBtn("ol",      <ListOrdered size={13} />, () => exec("insertOrderedList"),     "Numbered list")}
        <div className="w-px h-4 bg-outline-variant mx-1" />
        {toolbarBtn("hr",      <Minus size={13} />,       () => exec("insertHorizontalRule"),  "Divider")}
        <div className="flex-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); exec("formatBlock", "<p>"); }}
          className="text-[10px] text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
          title="Clear all formatting"
        >
          Clear
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-3 py-2.5 text-sm text-on-surface focus:outline-none leading-relaxed
          [&_strong]:font-bold [&_em]:italic [&_u]:underline
          [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-1 [&_h3]:mb-0.5
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
          [&_li]:my-0.5
          [&_hr]:border-outline-variant [&_hr]:my-2
          empty:before:content-[attr(data-placeholder)] empty:before:text-on-surface-variant/40 empty:before:pointer-events-none"
      />
    </div>
  );
}
