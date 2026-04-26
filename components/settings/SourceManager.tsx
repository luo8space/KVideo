'use client';

import { useState } from 'react';
import type { VideoSource } from '@/lib/types';

interface SourceManagerProps {
  sources: VideoSource[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onEdit?: (source: VideoSource) => void;
  defaultIds: string[];
}

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, '');
    if (parsed.hostname.length > 4) {
      return `${parsed.protocol}//${parsed.hostname.substring(0, 4)}****${parsed.hostname.substring(parsed.hostname.length - 4)}/${pathname}`;
    }
    return `${parsed.protocol}//${parsed.hostname.substring(0, 2)}****/${pathname}`;
  } catch {
    return url.substring(0, 8) + '********';
  }
}

export function SourceManager({
  sources,
  onToggle,
  onDelete,
  onReorder,
  onEdit,
  defaultIds
}: SourceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revealedUrls, setRevealedUrls] = useState<Set<string>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  const handleToggle = (id: string) => {
    onToggle(id);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handlePriorityChange = (id: string, direction: 'up' | 'down') => {
    onReorder(id, direction);
  };

  const toggleReveal = (id: string) => {
    setRevealedUrls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllReveal = () => {
    if (allRevealed) {
      setRevealedUrls(new Set());
    } else {
      setRevealedUrls(new Set(sources.map(s => s.id)));
    }
    setAllRevealed(!allRevealed);
  };

  return (
    <div className="space-y-3">
      {/* Global Reveal Toggle */}
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleAllReveal}
          className="text-xs px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors cursor-pointer"
        >
          {allRevealed ? '🔒 全部隐藏' : '👁 全部显示'}
        </button>
      </div>
      
      {sources.map((source, index) => (
        <div
          key={source.id}
          className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[var(--radius-2xl)] p-4 transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(source.id)}
                className="relative inline-block w-12 h-7 flex-shrink-0 cursor-pointer"
                aria-label={`切换 ${source.name} 状态`}
              >
                <span
                  className={`absolute inset-0 rounded-[var(--radius-full)] transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) ${source.enabled
                    ? 'bg-[var(--accent-color)]'
                    : 'bg-[color-mix(in_srgb,var(--text-color)_20%,transparent)]'
                    }`}
                />
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-[var(--radius-full)] shadow-sm transition-transform duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) ${source.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>

              {/* Source Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--text-color)] truncate">
                  {source.name}
                </div>
                <div className="text-sm text-[var(--text-color-secondary)] truncate flex items-center gap-2">
                  <span className="font-mono">
                    {revealedUrls.has(source.id) ? source.baseUrl : maskUrl(source.baseUrl)}
                  </span>
                  <button
                    onClick={() => toggleReveal(source.id)}
                    className="flex-shrink-0 p-1 rounded hover:bg-[var(--glass-border)] transition-colors cursor-pointer"
                    aria-label={revealedUrls.has(source.id) ? '隐藏地址' : '显示地址'}
                  >
                    {revealedUrls.has(source.id) ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority Controls */}
              <button
                onClick={() => handlePriorityChange(source.id, 'up')}
                disabled={index === 0}
                className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                aria-label="上移"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>

              <button
                onClick={() => handlePriorityChange(source.id, 'down')}
                disabled={index === sources.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                aria-label="下移"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </button>

              {/* Edit Button - Only for custom sources */}
              {onEdit && !defaultIds.includes(source.id) && (
                <button
                  onClick={() => onEdit(source)}
                  className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 cursor-pointer"
                  aria-label="编辑视频源"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(source.id)}
                className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                aria-label="删除视频源"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
