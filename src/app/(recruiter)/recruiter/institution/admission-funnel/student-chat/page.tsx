"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Sparkles,
  Search,
  Send,
  User,
  Paperclip,
  CheckCircle2,
  Clock,
  Phone,
  GraduationCap,
  FileText,
  Building,
  MoreVertical,
} from "lucide-react";

interface ChatThread {
  id: string;
  studentName: string;
  program: string;
  score: string;
  status: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: "student" | "counselor";
  text: string;
  time: string;
}

export default function InstitutionStudentChatPage() {
  const [activeThreadId, setActiveThreadId] = useState<string>("thread-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "thread-1",
      studentName: "Rohan Verma",
      program: "B.Tech CSE (AI & ML)",
      score: "JEE 98.4%ile",
      status: "Shortlisted",
      lastMessage: "Is there any merit scholarship for top 2,000 JEE Main rankers?",
      time: "10:14 AM",
      unreadCount: 1,
    },
    {
      id: "thread-2",
      studentName: "Sneha Mukherjee",
      program: "B.Tech Electronics & VLSI",
      score: "CET Rank 1,420",
      status: "Inquiry",
      lastMessage: "Could you share the lab equipment and industry tie-ups for VLSI design?",
      time: "Yesterday",
      unreadCount: 0,
    },
    {
      id: "thread-3",
      studentName: "Pooja Hegde",
      program: "MBA (FinTech & Analytics)",
      score: "CAT 94.8%ile",
      status: "Counseling Slot",
      lastMessage: "I have booked the online counseling round for Friday 3 PM.",
      time: "Yesterday",
      unreadCount: 0,
    },
    {
      id: "thread-4",
      studentName: "Divya Nair",
      program: "B.Tech CSE (AI & ML)",
      score: "JEE 99.1%ile",
      status: "Enrolled",
      lastMessage: "Thank you for the scholarship confirmation letter!",
      time: "Oct 06",
      unreadCount: 0,
    },
  ]);

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    "thread-1": [
      {
        id: "msg-1",
        sender: "student",
        text: "Hello, I received the shortlist notification for B.Tech Computer Science & AI.",
        time: "10:12 AM",
      },
      {
        id: "msg-2",
        sender: "counselor",
        text: "Congratulations Rohan! Your profile and JEE percentile (98.4%) put you in our top merit tier.",
        time: "10:13 AM",
      },
      {
        id: "msg-3",
        sender: "student",
        text: "Is there any merit scholarship for top 2,000 JEE Main rankers?",
        time: "10:14 AM",
      },
    ],
    "thread-2": [
      {
        id: "msg-4",
        sender: "student",
        text: "Could you share the lab equipment and industry tie-ups for VLSI design?",
        time: "Yesterday",
      },
    ],
    "thread-3": [
      {
        id: "msg-5",
        sender: "student",
        text: "I have booked the online counseling round for Friday 3 PM.",
        time: "Yesterday",
      },
    ],
    "thread-4": [
      {
        id: "msg-6",
        sender: "student",
        text: "Thank you for the scholarship confirmation letter!",
        time: "Oct 06",
      },
    ],
  });

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const activeMessages = messagesMap[activeThreadId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "counselor",
      text: inputText,
      time: "Just now",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }));

    setInputText("");
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">Student Chat</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Admission Funnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft mt-1">
            Direct real-time counseling communication with prospective applicants and parent inquiries.
          </p>
        </div>
      </div>

      {/* 2-Pane Chat Layout */}
      <div className="rounded-2xl border border-border bg-surface grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-xs min-h-[580px]">
        {/* Left Pane: Conversations List */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-border flex flex-col bg-surface-alt/30">
          <div className="p-3.5 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => {
                  setActiveThreadId(thread.id);
                  setThreads((prev) =>
                    prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
                  );
                }}
                className={`w-full text-left p-3.5 flex items-start justify-between gap-2 transition cursor-pointer ${
                  activeThreadId === thread.id
                    ? "bg-primary/10 border-l-3 border-primary-glow"
                    : "hover:bg-surface-alt/60"
                }`}
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-ink truncate">{thread.studentName}</span>
                    <span className="text-[10px] text-ink-soft">{thread.time}</span>
                  </div>
                  <span className="text-[10.5px] font-semibold text-primary-glow truncate block">
                    {thread.program}
                  </span>
                  <p className="text-[11px] text-ink-soft truncate">{thread.lastMessage}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center shrink-0">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane: Active Thread Window */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between bg-surface">
          {/* Top Bar of Thread */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-alt/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center font-bold text-xs shadow-glow">
                {activeThread.studentName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">{activeThread.studentName}</h3>
                <span className="text-[10px] text-ink-soft">
                  {activeThread.program} • <strong className="text-emerald-500">{activeThread.score}</strong>
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20">
              {activeThread.status}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "counselor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-xs ${
                    msg.sender === "counselor"
                      ? "bg-gradient-brand text-primary-foreground rounded-tr-xs"
                      : "bg-surface-alt text-ink border border-border rounded-tl-xs"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[9.5px] block text-right ${
                      msg.sender === "counselor" ? "text-primary-foreground/70" : "text-ink-soft"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reply Chips & Message Input */}
          <div className="p-3 border-t border-border space-y-2.5 bg-surface-alt/30">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                "Yes, top 2,000 JEE rankers get a 50% tuition waiver.",
                "Here is the link to download our 2027 Admission Brochure.",
                "Would you like to schedule an in-person campus visit?",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickReply(chip)}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border text-ink-soft hover:text-ink text-[10.5px] whitespace-nowrap transition cursor-pointer hover:border-primary/40"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type counseling message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-surface border border-border rounded-xl text-xs text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-95 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
