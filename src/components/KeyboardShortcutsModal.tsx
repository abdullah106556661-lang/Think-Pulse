import React from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'Chat & Prompting',
      shortcuts: [
        {
          keys: ['Ctrl', 'N'],
          description: 'Start a new conversation thread',
        },
        {
          keys: ['Enter'],
          description: 'Send prompt / message',
        },
        {
          keys: ['Shift', 'Enter'],
          description: 'Insert new line in textarea',
        },
        {
          keys: ['Ctrl', 'Shift', 'E'],
          description: 'Export active conversation history (.md / .json)',
        },
      ],
    },
    {
      title: 'Global Navigation & Search',
      shortcuts: [
        {
          keys: ['Ctrl', 'K'],
          description: 'Open global search & command palette',
        },
        {
          keys: ['Ctrl', 'B'],
          description: 'Toggle sidebar open / close',
        },
        {
          keys: ['Esc'],
          description: 'Close active modals, dialogs, or popovers',
        },
      ],
    },
    {
      title: 'Accessibility & System',
      shortcuts: [
        {
          keys: ['Ctrl', '/'],
          description: 'Open keyboard shortcuts cheatsheet',
        },
        {
          keys: ['?'],
          description: 'Quickly view keyboard shortcuts (when not typing)',
        },
      ],
    },
  ];

  return (
    <div
      id="keyboard-shortcuts-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        id="keyboard-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#1e1e1e] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e2e] bg-[#242424]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-slate-400">
                Speed up navigation and accessibility across ThinkPulse AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2e2e2e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {section.title}
              </div>
              <div className="space-y-1.5">
                {section.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#252525] border border-[#303030]"
                  >
                    <span className="text-xs text-slate-300 font-medium">
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {sc.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-1 text-[11px] font-mono font-semibold rounded-md bg-[#191919] border border-[#383838] text-cyan-300 shadow-sm">
                            {k}
                          </kbd>
                          {kIdx < sc.keys.length - 1 && (
                            <span className="text-slate-500 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#171717] border-t border-[#2e2e2e] flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[#252525] border border-[#383838] text-slate-300 font-mono">Esc</kbd> anytime to close
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#262626] hover:bg-[#303030] text-slate-200 hover:text-white border border-[#383838] text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
