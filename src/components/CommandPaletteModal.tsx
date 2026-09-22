import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Plus,
  Headphones,
  Download,
  Folder,
  Globe,
  Smartphone,
  Image,
  Video,
  FileText,
  Trophy,
  Mic,
  Keyboard,
  X,
  ArrowRight,
} from 'lucide-react';
import { Conversation, ViewMode } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onNavigate: (view: ViewMode) => void;
  onOpenLiveVoice: () => void;
  onOpenShortcutsHelp: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  conversations,
  onSelectConversation,
  onNewChat,
  onNavigate,
  onOpenLiveVoice,
  onOpenShortcutsHelp,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search filtered conversations
  const filteredConvs = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(query.toLowerCase())
  );

  // Quick Action commands
  const quickActions = [
    {
      id: 'action-new-chat',
      title: 'New Chat',
      description: 'Start a fresh conversation thread',
      icon: Plus,
      shortcut: 'Ctrl+N',
      execute: () => {
        onNewChat();
        onClose();
      },
    },
    {
      id: 'action-voice',
      title: 'Live Voice Mode (لائیو بات چیت)',
      description: 'Interactive natural two-way voice call',
      icon: Headphones,
      shortcut: 'Voice',
      execute: () => {
        onClose();
        onOpenLiveVoice();
      },
    },
    {
      id: 'action-website-builder',
      title: 'Website Builder Studio',
      description: 'Generate responsive landing pages and web apps',
      icon: Globe,
      execute: () => {
        onNavigate('dashboard-website');
        onClose();
      },
    },
    {
      id: 'action-app-builder',
      title: 'App Builder Studio',
      description: 'Create multi-view applications and prototypes',
      icon: Smartphone,
      execute: () => {
        onNavigate('dashboard-app');
        onClose();
      },
    },
    {
      id: 'action-image-studio',
      title: 'Image Studio',
      description: 'Generate high-definition visuals and assets',
      icon: Image,
      execute: () => {
        onNavigate('dashboard-image');
        onClose();
      },
    },
    {
      id: 'action-video-studio',
      title: 'Video Studio',
      description: 'Synthesize animated clips and scenes',
      icon: Video,
      execute: () => {
        onNavigate('dashboard-video');
        onClose();
      },
    },
    {
      id: 'action-sport-ai',
      title: 'Sport Team AI Strategy',
      description: 'Tactical analysis, lineups, and match predictions',
      icon: Trophy,
      execute: () => {
        onNavigate('dashboard-sport');
        onClose();
      },
    },
    {
      id: 'action-docs-ai',
      title: 'Document AI',
      description: 'Analyze PDF documents, data tables, and reports',
      icon: FileText,
      execute: () => {
        onNavigate('dashboard-docs');
        onClose();
      },
    },
    {
      id: 'action-library',
      title: 'Project Library',
      description: 'Browse saved assets, websites, and projects',
      icon: Folder,
      execute: () => {
        onNavigate('dashboard-library');
        onClose();
      },
    },
    {
      id: 'action-shortcuts-guide',
      title: 'Keyboard Shortcuts Guide',
      description: 'View all accessibility and navigation hotkeys',
      icon: Keyboard,
      shortcut: 'Ctrl+/',
      execute: () => {
        onClose();
        onOpenShortcutsHelp();
      },
    },
  ].filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase())
  );

  // Combine items for arrow-key navigation
  type PaletteItem =
    | { type: 'conv'; item: Conversation }
    | { type: 'action'; item: typeof quickActions[0] };

  const allItems: PaletteItem[] = [
    ...filteredConvs.slice(0, 8).map((c) => ({ type: 'conv' as const, item: c })),
    ...quickActions.map((a) => ({ type: 'action' as const, item: a })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.type === 'conv') {
          onSelectConversation(current.item.id);
          onNavigate('dashboard-chat');
          onClose();
        } else {
          current.item.execute();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      id="command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fadeIn"
    >
      <div
        id="command-palette-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2d2d2d] bg-[#242424]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search conversations, switch tools, or run actions..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333333]">
            Esc to close
          </span>
        </div>

        {/* Scrollable Results */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Matching Conversations */}
          {filteredConvs.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Conversations</span>
                <span className="font-mono text-cyan-400">{filteredConvs.length} found</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredConvs.slice(0, 8).map((conv, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onNavigate('dashboard-chat');
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 text-white border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-[#282828] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate min-w-0 pr-2">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="truncate">
                          <p className="text-xs font-medium truncate">{conv.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {conv.messages.length} messages • Updated{' '}
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-cyan-400' : 'opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions & Navigation */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Actions & Studios
              </div>
              <div className="space-y-0.5 mt-1">
                {quickActions.map((action, actionIdx) => {
                  const globalIdx = Math.min(filteredConvs.length, 8) + actionIdx;
                  const isSelected = selectedIndex === globalIdx;
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.id}
                      onClick={action.execute}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 text-white border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-[#282828] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-[#2a2a2a] text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold">{action.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{action.description}</p>
                        </div>
                      </div>

                      {action.shortcut && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171717] border border-[#333333] text-slate-400 shrink-0">
                          {action.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {allItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No conversations or commands found matching "{query}".
            </div>
          )}
        </div>

        {/* Modal Bottom Keyboard Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#171717] border-t border-[#2d2d2d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#262626] border border-[#383838] text-slate-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[#262626] border border-[#383838] text-slate-300">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#262626] border border-[#383838] text-slate-300">
                ↵
              </kbd>
              <span>select</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#262626] border border-[#383838] text-slate-300">
              Esc
            </kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
