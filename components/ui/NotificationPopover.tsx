'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, CheckCheck, ArrowUpRight, AlertTriangle, Layers, ShieldCheck, Clock } from 'lucide-react';
import Link from 'next/link';

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />;
      case 'handoff':
        return <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />;
      case 'audit':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-[#050606] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-[-3rem] sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-white/10">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-[#14171A]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Operational Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold px-1.5 py-0.5 rounded font-mono border border-blue-500/20">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  notifications.forEach((n) => markNotificationRead(n.id));
                }}
                className="text-[11px] text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 text-xs transition-colors ${
                    notif.read ? 'opacity-75 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-white/5' : 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getTypeIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white leading-tight">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 shrink-0 font-mono">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-neutral-300 mt-1 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <div className="mt-2 flex justify-end">
                          <Link
                            href={notif.link}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
                          >
                            <span>Open Details</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-neutral-500">
                  No notifications recorded
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
