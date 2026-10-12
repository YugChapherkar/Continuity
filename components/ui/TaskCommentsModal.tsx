'use client';

import React, { useState } from 'react';
import { Task, TaskComment } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { X, MessageSquare, Send, Clock, User, ShieldCheck } from 'lucide-react';

interface TaskCommentsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskCommentsModal({ task, isOpen, onClose }: TaskCommentsModalProps) {
  const { currentUser, addTaskComment, showToast } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const comments: TaskComment[] = task.comments || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addTaskComment(task.id, commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0B0D0E] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Task Discussion & Notes</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10">
                  {task.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate max-w-sm">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-neutral-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-neutral-600" />
              <p className="text-xs">No comments recorded on this task yet.</p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-600">Start the conversation or log technical notes below.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-2 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center font-mono">
                      {comment.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{comment.authorName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/5">
                      {comment.authorRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap pl-8">
                  {comment.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01]">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Comment as ${currentUser.name}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
