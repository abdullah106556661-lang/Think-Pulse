import { useEffect } from 'react';

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Chat' | 'System';
}

export const APP_KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Ctrl', 'N'],
    description: 'Start a new conversation',
    category: 'Chat',
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Open global search & command palette',
    category: 'Navigation',
  },
  {
    keys: ['Esc'],
    description: 'Close active modals, dialogs, or search',
    category: 'System',
  },
  {
    keys: ['Ctrl', 'B'],
    description: 'Toggle sidebar visibility',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Show keyboard shortcuts guide',
    category: 'System',
  },
];

interface UseGlobalShortcutsProps {
  onNewChat: () => void;
  onOpenSearch: () => void;
  onCloseModals: () => void;
  onToggleSidebar?: () => void;
  onOpenShortcutsHelp?: () => void;
  enabled?: boolean;
}

export function useGlobalKeyboardShortcuts({
  onNewChat,
  onOpenSearch,
  onCloseModals,
  onToggleSidebar,
  onOpenShortcutsHelp,
  enabled = true,
}: UseGlobalShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Platform-agnostic modifier key (Ctrl on Windows/Linux, Cmd on Mac)
      const hasModifier = e.ctrlKey || e.metaKey;

      // 1. Esc -> Close any active modal, dialog, or search
      if (e.key === 'Escape') {
        onCloseModals();
        return;
      }

      // 2. Ctrl+N / Cmd+N -> Start a new chat
      if (hasModifier && !e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        onNewChat();
        return;
      }

      // 3. Ctrl+K / Cmd+K -> Open global search / Command Palette
      if (hasModifier && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        onOpenSearch();
        return;
      }

      // 4. Ctrl+B / Cmd+B -> Toggle sidebar
      if (hasModifier && !e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        e.stopPropagation();
        onToggleSidebar?.();
        return;
      }

      // 5. Ctrl+/ or Cmd+/ -> Show shortcuts cheatsheet
      if (hasModifier && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        e.stopPropagation();
        onOpenShortcutsHelp?.();
        return;
      }

      // 6. '?' (Shift + /) outside of form fields -> Show shortcuts cheatsheet
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === '?' && !hasModifier && !isTyping) {
        e.preventDefault();
        onOpenShortcutsHelp?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [
    enabled,
    onNewChat,
    onOpenSearch,
    onCloseModals,
    onToggleSidebar,
    onOpenShortcutsHelp,
  ]);
}
