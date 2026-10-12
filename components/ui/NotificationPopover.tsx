'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, CheckCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#050606]" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B0D0E]/95 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F5F5F2]">Shift Activity & Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  notifications.forEach((n) => markNotificationRead(n.id));
                }}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 text-xs transition-colors ${
                    notif.read ? 'opacity-70 hover:opacity-100 hover:bg-white/5' : 'bg-blue-950/10 hover:bg-blue-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[#F5F5F2]">{notif.title}</p>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-neutral-300 mt-1 text-[11px] leading-relaxed">
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
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                      >
                        <span>Open Details</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-6 text-center text-xs text-neutral-500">
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
