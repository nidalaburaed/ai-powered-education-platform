"use client";

import { useState, useEffect } from "react";
import { getNotes, saveNote, deleteNote, exportNotes, type Note } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { Plus, Trash2, Download, StickyNote } from "lucide-react";

interface NotesProps {
  videoId: string;
  videoTitle: string;
  currentTime?: number;        // current playback seconds, passed from VideoPlayer
}

export default function Notes({ videoId, videoTitle, currentTime = 0 }: NotesProps) {
  const [notes, setNotes]     = useState<Note[]>([]);
  const [input, setInput]     = useState("");
  const [stampTime, setStamp] = useState(false);

  useEffect(() => {
    setNotes(getNotes(videoId));
  }, [videoId]);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    const ts   = stampTime ? currentTime : 0;
    const note = saveNote(videoId, text, ts);
    setNotes((prev) => [note, ...prev]);
    setInput("");
  };

  const handleDelete = (id: string) => {
    deleteNote(videoId, id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExport = () => exportNotes(videoTitle, notes);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.12)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:"rgba(232,168,56,0.08)" }}>
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-gold-400" />
          <span className="text-parchment-200 font-medium text-sm">
            My Notes
          </span>
          {notes.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(232,168,56,0.1)", color:"#e8a838" }}>
              {notes.length}
            </span>
          )}
        </div>
        {notes.length > 0 && (
          <button onClick={handleExport}
            className="flex items-center gap-1.5 text-parchment-600 hover:text-parchment-400 text-xs transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="p-5 border-b" style={{ borderColor:"rgba(232,168,56,0.08)" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd(); }}
          placeholder="Write a note... (Ctrl+Enter to save)"
          rows={3}
          className="input-warm resize-none w-full mb-3"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setStamp(!stampTime)}
              className="w-9 h-5 rounded-full relative transition-all duration-200 cursor-pointer"
              style={{ background: stampTime ? "rgba(232,168,56,0.6)" : "rgba(232,168,56,0.12)" }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-parchment-100 transition-all duration-200"
                style={{ left: stampTime ? "calc(100% - 18px)" : "2px" }} />
            </div>
            <span className="text-parchment-500 text-xs">
              Stamp time {stampTime && currentTime > 0 ? `(${formatDuration(Math.floor(currentTime))})` : ""}
            </span>
          </label>
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="btn-gold text-xs py-2 px-4 disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed">
            <Plus className="w-3.5 h-3.5" /> Add note
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="max-h-[380px] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-10 text-center">
            <StickyNote className="w-8 h-8 text-parchment-700 mx-auto mb-3" />
            <p className="text-parchment-600 text-sm italic">No notes yet. Start writing above.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor:"rgba(232,168,56,0.06)" }}>
            {notes.map((note) => (
              <div key={note.id} className="px-5 py-4 flex gap-3 group hover:bg-gold-400/[0.03] transition-colors">
                {/* Timestamp badge */}
                {note.timestamp > 0 && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded h-fit mt-0.5"
                    style={{ background:"rgba(232,168,56,0.1)", color:"#e8a838", fontFamily:'"JetBrains Mono",monospace' }}>
                    {formatDuration(Math.floor(note.timestamp))}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-parchment-300 text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                  <p className="text-parchment-700 text-xs mt-1.5">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => handleDelete(note.id)}
                  className="shrink-0 text-parchment-700 hover:text-clay-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
