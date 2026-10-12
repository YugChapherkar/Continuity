'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Inbox,
  CheckSquare,
  FileText,
  ClipboardCheck,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, currentUser } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userNotifs = notifications.filter(
    (n) => !n.recipientId || n.recipientId === currentUser.id
  );

  const filteredNotifs = userNotifs.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'handoff':
        return <Inbox className="w-4 h-4 text-blue-400" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'review':
        return <ClipboardCheck className="w-4 h-4 text-purple-400" />;
      case 'delivery':
        return <PackageCheck className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Notification Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
              Live In-App Events
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time notifications for task assignments, blocked tasks, report submissions, and delivery approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({userNotifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Unread ({userNotifs.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0B0D0E]/60 border border-white/[0.08]">
            <CheckCircle2 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-300">All caught up!</h3>
            <p className="text-xs text-neutral-500 mt-1">
              You have no unread notifications right now.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                notif.read
                  ? 'bg-white/[0.02] border-white/5 text-neutral-400'
                  : 'bg-white/[0.05] border-blue-500/30 text-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#F5F5F2]">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-neutral-500 font-mono block pt-0.5">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {notif.link && (
                <Link
                  href={notif.link}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/20 transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
