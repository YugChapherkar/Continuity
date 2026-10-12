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
        className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--surface-secondary)] transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[var(--surface-primary)] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--surface-primary)] backdrop-blur-md border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-secondary)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Operational Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-500 font-semibold px-1.5 py-0.5 rounded font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  notifications.forEach((n) => markNotificationRead(n.id));
                }}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 text-xs transition-colors ${
                    notif.read ? 'opacity-70 hover:opacity-100 hover:bg-[var(--surface-secondary)]' : 'bg-blue-500/5 hover:bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getTypeIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-[var(--text-primary)] leading-tight">{notif.title}</p>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1 text-[11px] leading-relaxed">
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
                            className="text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
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
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
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
