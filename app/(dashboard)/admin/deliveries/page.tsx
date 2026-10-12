'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  PackageCheck,
  Shield,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  X,
  FileCheck,
  Building,
  User,
  Radio,
  FileText,
} from 'lucide-react';

export default function AdminDeliveriesPage() {
  const { deliveries, projects, activeRole, refreshData, showToast } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliverablesListStr, setDeliverablesListStr] = useState('');
  const [clientAcknowledged, setClientAcknowledged] = useState(false);
  const [clientAckNotes, setClientAckNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected delivery detail modal
  const [activeDelivery, setActiveDelivery] = useState<any>(null);

  if (activeRole !== 'Admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Client release delivery recording and formal release ratification require Administrator authorization.
        </p>
      </div>
    );
  }

  // Find projects that are approved for delivery or delivered
  const approvedProjects = projects.filter(
    (p) => p.status === 'Approved for Delivery' || p.status === 'Delivered'
  );

  const pendingDeliveryProjects = projects.filter(
    (p) => p.status === 'Approved for Delivery'
  );

  const handleRecordDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !recipientContact || !deliveryChannel || !deliveryNotes) {
      showToast('Please fill in project, recipient contact, delivery channel, and notes', 'error');
      return;
    }

    const proj = projects.find((p) => p.id === selectedProjectId);
    const deliverables = deliverablesListStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setIsSubmitting(true);
    try {
      await api.recordClientDelivery({
        projectId: selectedProjectId,
        deliveredVersion: proj?.currentVersionId,
        recipientContact,
        deliveryChannel,
        deliveryNotes,
        deliverablesList: deliverables.length > 0 ? deliverables : ['Production binary & documentation bundle'],
        clientAcknowledged,
        clientAcknowledgmentNotes: clientAckNotes || undefined,
      });
      await refreshData();
      showToast('Client delivery recorded and ratified on audit ledger!', 'success');
      setIsRecordModalOpen(false);
      setSelectedProjectId('');
      setRecipientContact('');
      setDeliveryChannel('');
      setDeliveryNotes('');
      setDeliverablesListStr('');
      setClientAcknowledged(false);
    } catch (err: any) {
      showToast(err.message || 'Error recording client delivery', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleClientAck = async (delivery: any) => {
    const newAck = !delivery.clientAcknowledged;
    try {
      await api.updateDeliveryAcknowledgment({
        deliveryId: delivery.id,
        clientAcknowledged: newAck,
        clientAcknowledgmentNotes: newAck
          ? `Ratified client receipt confirmation on ${new Date().toLocaleDateString()}`
          : undefined,
      });
      await refreshData();
      showToast(
        newAck ? 'Client delivery acknowledgment ratified.' : 'Acknowledgment unchecked.',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Error updating acknowledgment', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Client Deliveries & Releases</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              Production Release Ledger
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Immutable tracking of client handovers, delivery channels, verified release versions, and customer receipt acknowledgments.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Client Delivery</span>
        </button>
      </div>

      {/* Pending Deliveries Banner if any approved projects exist */}
      {pendingDeliveryProjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>{pendingDeliveryProjects.length} Project(s) Approved & Ready for Delivery</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingDeliveryProjects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-[#0B0D0E] border border-cyan-500/30 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-[11px] text-cyan-400 font-mono">
                    Version: {p.currentVersionId} · {p.client}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setIsRecordModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors cursor-pointer"
                >
                  Deliver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliveries Feed */}
      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0B0D0E]/60 border border-white/[0.08]">
            <PackageCheck className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-300">No Recorded Client Deliveries</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Once deliverables are approved and handed over to external clients, immutable records will appear here.
            </p>
          </div>
        ) : (
          deliveries.map((delivery) => {
            const project = projects.find((p) => p.id === delivery.projectId);

            return (
              <div
                key={delivery.id}
                className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] hover:border-white/15 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-blue-400 font-bold">{delivery.id}</span>
                      <h2 className="text-base font-bold text-white">{delivery.projectName}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {delivery.approvedVersion}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-3">
                      <span>Delivered on: <span className="font-mono text-neutral-300">{new Date(delivery.deliveredAt).toLocaleDateString()}</span></span>
                      <span>·</span>
                      <span>Recorded by Admin: <span className="text-white font-medium">{delivery.recordedByName}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleClientAck(delivery)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono border flex items-center gap-1.5 transition-colors cursor-pointer ${
                        delivery.clientAcknowledged
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-neutral-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{delivery.clientAcknowledged ? 'Client Acknowledged' : 'Pending Client Receipt'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Recipient & Contact
                      </span>
                      <span className="font-medium text-white">{delivery.recipientContact}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Delivery Channel / Reference
                      </span>
                      <span className="font-mono text-blue-400">{delivery.deliveryChannel}</span>
                    </div>

                    {delivery.clientAcknowledgmentNotes && (
                      <div className="pt-2 border-t border-white/5 text-neutral-300 italic">
                        "{delivery.clientAcknowledgmentNotes}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Included Deliverables
                      </span>
                      <ul className="list-disc list-inside text-neutral-300 space-y-0.5 mt-1 font-mono text-[11px]">
                        {delivery.deliverablesList.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Delivery Notes
                      </span>
                      <p className="text-neutral-300 mt-1 leading-relaxed">{delivery.deliveryNotes}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Record Client Delivery */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Record Client Release Delivery</h2>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Select Approved Project *
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Select project ready for client delivery...</option>
                  {approvedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currentVersionId}) — {p.client || 'Client'} [{p.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Recipient Contact / Client Stakeholder *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Hayes (CTO, Apex Financial LLC)"
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Delivery Channel & Reference *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Encrypted GPG Artifact Transfer (Ref: APEX-REL-492)"
                  value={deliveryChannel}
                  onChange={(e) => setDeliveryChannel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Deliverables List (1 per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Production binary v2.4.0\nSigned GPG Checksums\nRunbook Playbook & SRE Guides"
                  value={deliverablesListStr}
                  onChange={(e) => setDeliverablesListStr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Delivery Notes & Handover Statement *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Official handover statement and release certification notes..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/10 rounded-xl">
                <input
                  type="checkbox"
                  id="clientAckCheck"
                  checked={clientAcknowledged}
                  onChange={(e) => setClientAcknowledged(e.target.checked)}
                  className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-0"
                />
                <label htmlFor="clientAckCheck" className="text-xs text-neutral-300 cursor-pointer">
                  Client has already acknowledged and confirmed receipt of deliverables
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record Client Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
