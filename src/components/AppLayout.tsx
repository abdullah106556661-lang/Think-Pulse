import React, { useState } from 'react';
import { ViewMode, User, SupportedLanguage, Conversation } from '../types';
import { ThinkPulseLogo } from './ThinkPulseLogo';
import { TRANSLATIONS } from '../utils/translations';
import {
  Bot,
  Globe,
  Layers,
  Image as ImageIcon,
  Video,
  Radio,
  FileText,
  Folder,
  LifeBuoy,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Crown,
  PhoneCall,
  Trophy,
  Trash2,
  Edit2,
  Plus,
  Search,
  Settings,
  PanelLeft,
  PanelLeftClose,
  Headphones,
  Music,
  CreditCard,
  MessageSquare,
  Compass,
  Download,
  Code,
  Keyboard,
  Sun,
  Moon,
} from 'lucide-react';
import {
  exportConversationAsJSON,
  exportConversationAsMarkdown,
} from '../utils/exportUtils';

interface AppLayoutProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: User | null;
  onLogout: () => void;
  currentLanguage: SupportedLanguage;
  onOpenLiveCall?: () => void;
  conversations?: Conversation[];
  activeConvId?: string;
  onSelectConv?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConv?: (id: string) => void;
  onOpenJazzCash?: (plan: 'pro' | 'enterprise') => void;
  onOpenSearch?: () => void;
  onOpenShortcutsHelp?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  currentLanguage,
  onOpenLiveCall,
  conversations = [],
  activeConvId,
  onSelectConv,
  onNewChat,
  onDeleteConv,
  onOpenJazzCash,
  onOpenSearch,
  onOpenShortcutsHelp,
  sidebarCollapsed,
  onToggleSidebar,
  children,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = sidebarCollapsed !== undefined ? sidebarCollapsed : internalCollapsed;
  const toggleCollapse = onToggleSidebar || (() => setInternalCollapsed(!collapsed));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [exportingConvId, setExportingConvId] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const isAdmin = Boolean(user && user.role === 'admin' && user.email?.toLowerCase().trim() === 'abdullah106556661@gmail.com');

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('thinkpulse_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ChatGPT-style GPTs and Specialized Studio tools
  const gptTools: Array<{
    id: ViewMode;
    label: string;
    description: string;
    icon: any;
    badge?: string;
    isSpecial?: boolean;
  }> = [
    {
      id: 'dashboard-chat',
      label: 'ThinkPulse Chat (4o)',
      description: 'General intelligence & reasoning',
      icon: Bot,
    },
    {
      id: 'dashboard-sport',
      label: 'Sport Tactical AI',
      description: 'Cricket & Football live tactical master',
      icon: Trophy,
      badge: 'TACTICS',
      isSpecial: true,
    },
    {
      id: 'dashboard-image',
      label: 'DALL·E Image Studio',
      description: 'High definition neural image synthesis',
      icon: ImageIcon,
      badge: 'PRO GPU',
    },
    {
      id: 'dashboard-video',
      label: 'Veo / Sora Video Studio',
      description: 'Cinematic AI video generation',
      icon: Video,
      badge: 'VEO 3',
    },
    {
      id: 'dashboard-website',
      label: 'Canvas Website Builder',
      description: 'Interactive real-time web builder',
      icon: Globe,
      badge: 'CANVAS',
      isSpecial: true,
    },
    {
      id: 'dashboard-app',
      label: 'App & Code Sandbox',
      description: 'Full-stack application synthesis',
      icon: Layers,
    },
    {
      id: 'dashboard-voice',
      label: 'Voice Lab & Audio',
      description: 'Text-to-speech & multi-speaker clone',
      icon: Radio,
    },
    {
      id: 'dashboard-docs',
      label: 'Document & Data Analyst',
      description: 'PDF, CSV, audio & multi-doc analyst',
      icon: FileText,
    },
    {
      id: 'dashboard-pricing',
      label: 'Pricing & Plans',
      description: 'Subscriptions, tokens & JazzCash',
      icon: CreditCard,
      badge: 'PRO',
    },
    {
      id: 'dashboard-domains',
      label: 'Domain Registry & SSL',
      description: 'Search, buy & manage custom domains',
      icon: Globe,
      badge: 'NEW',
    },
    {
      id: 'dashboard-library',
      label: 'Project Library',
      description: 'Saved images, sites & assets',
      icon: Folder,
    },
    {
      id: 'seo-abdullah-brand',
      label: 'Abdullah 55566 hacker',
      description: 'Official creator hub & public profile',
      icon: Globe,
      badge: 'PUBLIC',
    },
  ];

  if (isAdmin) {
    gptTools.push({
      id: 'dashboard-admin',
      label: 'Super Admin Portal',
      description: 'Security, user quota & telemetry',
      icon: ShieldCheck,
      badge: 'ADMIN',
      isSpecial: true,
    });
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Group conversations chronologically (Today, Yesterday, Previous 7 Days, Older)
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const todayChats = filteredConversations.filter((c) => {
    const diff = now - new Date(c.updatedAt).getTime();
    return diff < oneDay;
  });

  const yesterdayChats = filteredConversations.filter((c) => {
    const diff = now - new Date(c.updatedAt).getTime();
    return diff >= oneDay && diff < 2 * oneDay;
  });

  const previousWeekChats = filteredConversations.filter((c) => {
    const diff = now - new Date(c.updatedAt).getTime();
    return diff >= 2 * oneDay && diff < sevenDays;
  });

  const olderChats = filteredConversations.filter((c) => {
    const diff = now - new Date(c.updatedAt).getTime();
    return diff >= sevenDays;
  });

  const renderConversationItem = (c: Conversation) => {
    const isSelected = activeConvId === c.id && currentView === 'dashboard-chat';
    const isExportOpen = exportingConvId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => {
          onSelectConv?.(c.id);
          onNavigate('dashboard-chat');
          setMobileOpen(false);
        }}
        className={`group relative w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
          isSelected
            ? 'bg-[#212121] text-white font-medium border border-[#333333]'
            : 'text-slate-400 hover:bg-[#212121]/70 hover:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-slate-400" />
          <span className="truncate">{c.title}</span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Quick Export Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExportingConvId(isExportOpen ? null : c.id);
            }}
            className={`p-1 rounded transition-all ${
              isExportOpen
                ? 'opacity-100 text-cyan-400 bg-[#282828]'
                : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white hover:bg-[#282828]'
            }`}
            title="Export conversation history (.md / .json)"
          >
            <Download className="w-3 h-3" />
          </button>

          {/* Delete Button */}
          {onDeleteConv && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConv(c.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 rounded transition-all hover:bg-[#282828]"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Popover Menu for Exporting this specific conversation */}
        {isExportOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-1 w-52 bg-[#181818] border border-[#383838] rounded-xl p-1.5 shadow-2xl z-50 animate-fadeIn"
          >
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#262626] mb-1 flex items-center justify-between">
              <span>Export Record</span>
              <span className="text-cyan-400 font-mono text-[9px]">{c.messages.length} msgs</span>
            </div>
            <button
              onClick={() => {
                exportConversationAsMarkdown(c);
                setExportingConvId(null);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-slate-200 hover:bg-[#282828] hover:text-cyan-300 transition-colors text-left"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Markdown (.md)</span>
            </button>
            <button
              onClick={() => {
                exportConversationAsJSON(c);
                setExportingConvId(null);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-slate-200 hover:bg-[#282828] hover:text-purple-300 transition-colors text-left"
            >
              <Code className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Structured JSON (.json)</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-[#212121] text-[#ececec] overflow-hidden font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ChatGPT Sleek Left Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-[#2d2d2d] bg-[#171717] transition-all duration-250 ease-in-out ${
          collapsed ? 'w-0 lg:w-0 border-r-0 overflow-hidden' : 'w-72'
        } ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-[calc(100vh-80px)]">
          {/* Top Sidebar Header (ChatGPT Style) */}
          <div className="h-14 px-3.5 flex items-center justify-between border-b border-[#262626]/80 shrink-0">
            <div
              onClick={() => onNavigate('landing')}
              className="cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
              title="Return to Home"
            >
              <ThinkPulseLogo size="sm" animated />
              <span className="text-xs font-bold text-white tracking-wide">ThinkPulse</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Theme Switcher Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-[#212121] transition-colors"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
              </button>

              {/* New Chat Button (Square Pen) */}
              <button
                onClick={() => {
                  onNewChat?.();
                  onNavigate('dashboard-chat');
                  setMobileOpen(false);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#212121] transition-colors"
                title="New chat (Ctrl+N)"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Collapse Sidebar Button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#212121] transition-colors"
                title="Toggle sidebar (Ctrl+B)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ChatGPT-style "New chat" large pill trigger */}
          <div className="p-3 pb-1.5 shrink-0">
            <button
              onClick={() => {
                onNewChat?.();
                onNavigate('dashboard-chat');
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-white bg-[#212121] hover:bg-[#2a2a2a] border border-[#303030] shadow-sm transition-all cursor-pointer group"
              title="New chat (Ctrl+N)"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span>New chat</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono group-hover:text-cyan-300 px-1.5 py-0.5 rounded bg-[#181818] border border-[#333333]">
                Ctrl+N
              </span>
            </button>
          </div>

          {/* Search Chats Input & Ctrl+K trigger */}
          <div className="px-3 py-1.5 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#212121] text-xs text-slate-200 placeholder-slate-500 pl-8 pr-16 py-1.5 rounded-lg border border-[#2d2d2d] focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                {searchFilter ? (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="p-1 text-slate-500 hover:text-slate-300"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  onOpenSearch && (
                    <button
                      onClick={onOpenSearch}
                      className="px-1.5 py-0.5 rounded bg-[#181818] hover:bg-[#282828] border border-[#333333] text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Open Command Palette (Ctrl+K)"
                    >
                      Ctrl+K
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Navigation & Chronological Chat History */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {/* 1. Explore GPTs & Specialized Workspaces */}
            <div>
              <div className="px-2 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ThinkPulse GPTs & Studios
                </span>
                <span className="text-[10px] font-mono text-cyan-400">PRO</span>
              </div>
              <div className="space-y-0.5">
                {gptTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = currentView === tool.id;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onNavigate(tool.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-[#212121] text-white border border-[#383838] shadow-sm'
                          : 'text-slate-400 hover:bg-[#212121]/70 hover:text-slate-200'
                      }`}
                      title={tool.description}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : tool.isSpecial
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate flex-1 text-left">{tool.label}</span>
                      {tool.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {tool.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Chronological Chat History (ChatGPT Style) */}
            <div className="pt-2 border-t border-[#262626]">
              {/* Today */}
              {todayChats.length > 0 && (
                <div className="mb-3">
                  <span className="px-2 text-[10px] font-semibold text-slate-500 block mb-1">
                    Today
                  </span>
                  <div className="space-y-0.5">
                    {todayChats.map(renderConversationItem)}
                  </div>
                </div>
              )}

              {/* Yesterday */}
              {yesterdayChats.length > 0 && (
                <div className="mb-3">
                  <span className="px-2 text-[10px] font-semibold text-slate-500 block mb-1">
                    Yesterday
                  </span>
                  <div className="space-y-0.5">
                    {yesterdayChats.map(renderConversationItem)}
                  </div>
                </div>
              )}

              {/* Previous 7 Days */}
              {previousWeekChats.length > 0 && (
                <div className="mb-3">
                  <span className="px-2 text-[10px] font-semibold text-slate-500 block mb-1">
                    Previous 7 Days
                  </span>
                  <div className="space-y-0.5">
                    {previousWeekChats.map(renderConversationItem)}
                  </div>
                </div>
              )}

              {/* Older Chats */}
              {olderChats.length > 0 && (
                <div className="mb-3">
                  <span className="px-2 text-[10px] font-semibold text-slate-500 block mb-1">
                    Previous 30 Days
                  </span>
                  <div className="space-y-0.5">
                    {olderChats.map(renderConversationItem)}
                  </div>
                </div>
              )}

              {filteredConversations.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-slate-500">
                  No conversations found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ChatGPT Bottom Profile Bar */}
        <div className="min-h-20 p-3 border-t border-[#262626] bg-[#141414] flex flex-col justify-center relative">
          {user ? (
            <>
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity flex-1 min-w-0"
                >
                  {/* User Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      {isAdmin && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-cyan-400 font-mono truncate">
                      {isAdmin ? 'Super Admin ∞' : `${user?.plan || 'Free'} Plan`}
                    </p>
                  </div>
                </div>

                {/* Quick Live Voice Mode Launcher */}
                {onOpenLiveCall && (
                  <button
                    onClick={onOpenLiveCall}
                    className="p-2 rounded-xl text-cyan-400 hover:text-white hover:bg-[#212121] transition-colors"
                    title="ChatGPT Advanced Voice Mode (لائیو بات چیت)"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                )}

                {/* Quick Keyboard Shortcuts Cheatsheet Trigger */}
                {onOpenShortcutsHelp && (
                  <button
                    onClick={onOpenShortcutsHelp}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-[#212121] transition-colors"
                    title="Keyboard shortcuts guide (Ctrl+/)"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-[#212121] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Quick User Plan status */}
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Tokens:</span>
                <span className={user?.unlimitedAccess ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {user?.unlimitedAccess ? '∞ Unlimited' : (user?.tokensRemaining?.toLocaleString() || '1,000,000')}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate('auth-login')}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-slate-200 hover:text-white text-xs font-medium border border-[#333] transition-colors text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('auth-signup')}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all text-center"
                >
                  Sign Up Free
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Sign in to save chats & unlock all models
              </p>
            </div>
          )}

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute bottom-20 left-3 right-3 bg-[#212121] border border-[#333] rounded-2xl p-2 shadow-2xl space-y-1 z-50">
              <button
                onClick={() => {
                  onNavigate('dashboard-profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>My Profile & Security</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('dashboard-pricing');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Pricing & Subscriptions</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('dashboard-support');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & Preferences</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('seo-abdullah-brand');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-left"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Creator: Abdullah 55566 hacker</span>
              </button>
              {onOpenShortcutsHelp && (
                <button
                  onClick={() => {
                    onOpenShortcutsHelp();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Keyboard className="w-4 h-4 text-cyan-400" />
                    <span>Keyboard Shortcuts</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-[#191919] px-1.5 py-0.5 rounded border border-[#333]">
                    Ctrl+/
                  </span>
                </button>
              )}
              {onOpenJazzCash && (
                <button
                  onClick={() => {
                    onOpenJazzCash('enterprise');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Upgrade Plan (JazzCash)</span>
                </button>
              )}
              <div className="border-t border-[#333] my-1" />
              <button
                onClick={() => {
                  onLogout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden relative">
        {/* Floating Sidebar Re-open button when collapsed */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            className="absolute top-3 left-3 z-30 p-2 rounded-xl bg-[#212121] hover:bg-[#2a2a2a] border border-[#333333] text-slate-400 hover:text-white transition-all shadow-md"
            title="Open sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Mobile top bar */}
        <div className="lg:hidden h-14 px-4 border-b border-[#2d2d2d] bg-[#171717] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <ThinkPulseLogo size="sm" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-[#212121] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>
            <button
              onClick={() => {
                onNewChat?.();
                onNavigate('dashboard-chat');
              }}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#212121]"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Child Router View */}
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
