'use client';

import { useState, useEffect } from 'react';
import type { VideoSource } from '@/lib/types';
import { ModalBackdrop } from '@/components/ui/ModalBackdrop';

interface SourceManagerProps {
  sources: VideoSource[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onEdit?: (source: VideoSource) => void;
  defaultIds: string[];
}

const SOURCE_VIEW_PASSWORD = process.env.NEXT_PUBLIC_SOURCE_VIEW_PASSWORD || 'KVideo_Secure_2024!#$%^&*()_+-=[]{}|;:,.<>?';

function maskUrl(url: string): string {
  return '●●●●●●●●●●●●●●●';
}

function maskName(name: string): string {
  return '●●●●●●●';
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
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kvideo_source_unlocked');
    if (saved === 'true') {
      setIsLocked(false);
    }
  }, []);

  const handleUnlock = () => {
    if (password === SOURCE_VIEW_PASSWORD) {
      setIsLocked(false);
      setError('');
      setShowPasswordModal(false);
      setPassword('');
      localStorage.setItem('kvideo_source_unlocked', 'true');
    } else {
      setError('密码错误，请重试');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    localStorage.removeItem('kvideo_source_unlocked');
  };

  const handleToggle = (id: string) => {
    onToggle(id);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handlePriorityChange = (id: string, direction: 'up' | 'down') => {
    onReorder(id, direction);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Lock/Unlock Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => isLocked ? setShowPasswordModal(true) : handleLock()}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] transition-colors cursor-pointer flex items-center gap-1"
          >
            {isLocked ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>🔒 解锁查看</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
                <span>🔒 锁定保护</span>
              </>
            )}
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
                  aria-label={`切换 ${isLocked ? '名称' : source.name} 状态`}
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
                    {isLocked ? maskName(source.name) : source.name}
                  </div>
                  <div className="text-sm text-[var(--text-color-secondary)] truncate font-mono">
                    {isLocked ? maskUrl(source.baseUrl) : source.baseUrl}
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

    {/* Password Modal */}
    {showPasswordModal && (
      <>
        <ModalBackdrop isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
        <div className="fixed top-1/2 left-1/2 z-[9999] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2">
          <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4 text-center">
              🔒 输入访问密码
            </h3>
            <p className="text-sm text-[var(--text-color-secondary)] mb-4 text-center">
              请输入密码以查看视频源信息
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="请输入密码"
              className="w-full bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-[var(--radius-2xl)] px-4 py-3 mb-3 text-[var(--text-color)] placeholder:text-[var(--text-color-secondary)] focus:outline-none focus:border-[var(--accent-color)] transition-all"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--text-color)_10%,transparent)] transition-all"
              >
                取消
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 px-4 py-2 rounded-[var(--radius-2xl)] bg-[var(--accent-color)] text-white font-semibold hover:brightness-110 transition-all"
              >
                解锁
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </>
  );
}
