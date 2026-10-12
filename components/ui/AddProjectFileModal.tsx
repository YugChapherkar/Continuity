'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectFile } from '@/lib/types';
import { FileCode, X, Plus, FileText, Settings, Database } from 'lucide-react';

interface AddProjectFileModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onFileAdded?: (file: ProjectFile) => void;
}

export function AddProjectFileModal({
  projectId,
  isOpen,
  onClose,
  onFileAdded,
}: AddProjectFileModalProps) {
  const { addProjectFile, showToast } = useApp();

  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [type, setType] = useState<ProjectFile['type']>('code');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide a file name', 'error');
      return;
    }

    const calculatedPath = path.trim() || `src/${name.trim()}`;
    const calculatedSize = `${(content.length / 1024).toFixed(1)} KB`;

    const newFile: ProjectFile = {
      name: name.trim(),
      path: calculatedPath,
      type,
      size: content.length > 0 ? calculatedSize : '1.2 KB',
      contentSnippet: content.trim() || `// ${name.trim()}\n// Specification and implementation\n`,
    };

    addProjectFile(projectId, newFile);
    if (onFileAdded) onFileAdded(newFile);

    // Reset & close
    setName('');
    setPath('');
    setType('code');
    setContent('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F5F2]">Add Workspace Source File</h3>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                Register a new specification, code module, or config file in this repository.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                File Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!path) setPath(`src/${e.target.value}`);
                }}
                placeholder="e.g. raft_consensus.rs"
                required
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                File Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectFile['type'])}
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
              >
                <option value="code">Source Code (.rs, .go, .ts)</option>
                <option value="config">Configuration (.toml, .yaml)</option>
                <option value="schema">Schema / Proto (.proto, .sql)</option>
                <option value="doc">Documentation (.md)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              Repository Relative Path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. src/consensus/raft_consensus.rs"
              className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
              File Content / Code Snippet
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="// Enter code, configuration, or documentation..."
              className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add File</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
