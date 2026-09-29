import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { ViewMode, User, SupportedLanguage, GeneratedWebsiteProject, Conversation } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { AppLayout } from './components/AppLayout';
import { ChatView } from './components/ChatView';
import { WebsiteBuilderView } from './components/WebsiteBuilderView';
import { AppBuilderView } from './components/AppBuilderView';
import { ImageStudioView } from './components/ImageStudioView';
import { VideoStudioView } from './components/VideoStudioView';
import { MusicStudioView } from './components/MusicStudioView';
import { AudioTranscribeView } from './components/AudioTranscribeView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { DocumentAIView } from './components/DocumentAIView';
import { LibraryView } from './components/LibraryView';
import { SupportSettingsView } from './components/SupportSettingsView';
import { AdminPortalView } from './components/AdminPortalView';
import { UserProfileView } from './components/UserProfileView';
import { PricingView } from './components/PricingView';
import { SportTeamAIView } from './components/SportTeamAIView';
import { AbdullahHackerSEOView } from './components/AbdullahHackerSEOView';
import { DomainsView } from './components/DomainsView';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { JazzCashModal } from './components/JazzCashModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';

export default function App() {
  // Determine view based on URL and user authentication state
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/abdullah-55566-hacker')) {
        return 'seo-abdullah-brand';
      }
      if (path === '/login') {
        return 'auth-login';
      }
      if (path === '/signup') {
        return 'auth-signup';
      }
      if (path === '/domains') {
        return 'dashboard-domains';
      }
      if (path === '/admin') {
        try {
          const savedToken = localStorage.getItem('thinkpulse_token');
          const savedUser = localStorage.getItem('thinkpulse_user');
          if (savedToken && savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed?.email?.toLowerCase().trim() === 'abdullah106556661@gmail.com') {
              return 'dashboard-admin';
            }
          }
        } catch {}
        return 'auth-login';
      }
    }
    // If a genuine user session exists in storage, start in ChatGPT dashboard; otherwise show Sign In / Login interface first
    try {
      const savedToken = localStorage.getItem('thinkpulse_token');
      const savedUser = localStorage.getItem('thinkpulse_user');
      if (savedToken && savedToken !== 'thinkpulse_super_admin' && savedUser) {
        return 'dashboard-chat';
      }
    } catch {}
    return 'auth-login'; // First screen is Sign In / Login as requested
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedToken = localStorage.getItem('thinkpulse_token');
      const savedUser = localStorage.getItem('thinkpulse_user');
      // Clean up any legacy forced super-admin mock session
      if (savedToken === 'thinkpulse_super_admin') {
        localStorage.removeItem('thinkpulse_token');
        localStorage.removeItem('thinkpulse_user');
        return null;
      }
      if (savedUser && savedToken) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) return parsed;
      }
    } catch {}
    return null; // Visitors start unauthenticated as guests
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/abdullah-55566-hacker')) {
        setCurrentView('seo-abdullah-brand');
      } else if (path === '/login') {
        setCurrentView('auth-login');
      } else if (path === '/signup') {
        setCurrentView('auth-signup');
      } else if (path === '/domains') {
        setCurrentView('dashboard-domains');
      } else if (path === '/landing') {
        setCurrentView('landing');
      } else if (path === '/admin') {
        setCurrentView(user?.email?.toLowerCase().trim() === 'abdullah106556661@gmail.com' ? 'dashboard-admin' : 'auth-login');
      } else if (path === '/') {
        setCurrentView(user ? 'dashboard-chat' : 'auth-login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, user]);

  const handleNavigate = (view: ViewMode) => {
    if (view === 'seo-abdullah-brand') {
      window.history.pushState({}, '', '/abdullah-55566-hacker');
    } else if (view === 'auth-login') {
      window.history.pushState({}, '', '/login');
    } else if (view === 'auth-signup') {
      window.history.pushState({}, '', '/signup');
    } else if (view === 'dashboard-domains') {
      window.history.pushState({}, '', '/domains');
    } else if (view === 'dashboard-admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'landing') {
      window.history.pushState({}, '', '/landing');
    } else if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [liveVoiceOpen, setLiveVoiceOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jazzCashModal, setJazzCashModal] = useState<{ isOpen: boolean; plan: 'pro' | 'enterprise' }>({
    isOpen: false,
    plan: 'pro',
  });
  const [libraryItems, setLibraryItems] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('thinkpulse_library');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Shared ChatGPT Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('thinkpulse_conversations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'conv_1',
        title: 'Quantum Computing & Algorithms',
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        model: 'gemini-3.8-flash',
        thinkingEnabled: true,
        messages: [
          {
            id: 'msg_1',
            role: 'assistant',
            content: 'Hello! I am **ThinkPulse AI (4o)**. How can I assist you with code, complex problem solving, creative synthesis, or deep reasoning today?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            modelUsed: 'gemini-3.8-flash',
          },
        ],
      },
      {
        id: 'conv_2',
        title: 'Cricket Tactical Playbook',
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        model: 'gemini-3.8-flash',
        thinkingEnabled: true,
        messages: [
          {
            id: 'msg_2',
            role: 'assistant',
            content: 'Cricket tactical engine ready. Pitch report, death-over field placements, and bowling matchups loaded.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            modelUsed: 'gemini-3.8-flash',
          },
        ],
      },
    ];
  });
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');

  // Check and sync existing session on load with server
  useEffect(() => {
    const syncSession = async () => {
      const token = localStorage.getItem('thinkpulse_token');
      // No token or legacy mock token: do not auto-authenticate
      if (!token || token === 'thinkpulse_super_admin') {
        if (token === 'thinkpulse_super_admin') {
          localStorage.removeItem('thinkpulse_token');
          localStorage.removeItem('thinkpulse_user');
          setUser(null);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
            return;
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token is invalid or expired
          localStorage.removeItem('thinkpulse_token');
          localStorage.removeItem('thinkpulse_user');
          setUser(null);
        }
      } catch (e) {
        console.warn('Session sync from server warning:', e);
      }
    };

    syncSession();
  }, []);

  const handleNewChat = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New chat',
      updatedAt: new Date().toISOString(),
      model: 'gemini-3.8-flash',
      thinkingEnabled: true,
      messages: [],
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConvId(newId);
    setCurrentView('dashboard-chat');
    localStorage.setItem('thinkpulse_conversations', JSON.stringify(updated));
    syncConversationsToServer(updated);
  };

  const syncConversationsToServer = (convs: Conversation[]) => {
    try {
      const token = localStorage.getItem('thinkpulse_token');
      fetch('/api/conversations/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ conversations: convs }),
      }).catch(() => {});
    } catch {}
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setCurrentView('dashboard-chat');
  };

  const handleDeleteConv = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem('thinkpulse_conversations', JSON.stringify(updated));
    syncConversationsToServer(updated);
    if (activeConvId === id) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Save library updates
  const handleSaveToLibrary = (item: any) => {
    setLibraryItems((prev) => {
      const updated = [item, ...prev.filter((i) => i.id !== item.id)];
      localStorage.setItem('thinkpulse_library', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteLibraryItem = (id: string) => {
    setLibraryItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem('thinkpulse_library', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentView('dashboard-chat');
  };

  const handleLogout = () => {
    localStorage.removeItem('thinkpulse_token');
    localStorage.removeItem('thinkpulse_user');
    setUser(null);
    setCurrentView('landing');
  };

  const handlePaymentSuccess = (upgradedPlan: string, transaction?: any) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        plan: upgradedPlan,
        tokensRemaining: upgradedPlan === 'enterprise' ? 10000000 : 2500000,
      };
      setUser(updatedUser);
      localStorage.setItem('thinkpulse_user', JSON.stringify(updatedUser));
    }
  };

  // Launch quick prompt from Landing Page
  const handleQuickPrompt = (prompt: string, targetTool: ViewMode) => {
    if (!user) {
      // Require registration / sign-in so user creates their own account
      setCurrentView('auth-signup');
      return;
    }
    setCurrentView(targetTool);
  };

  // Global Keyboard Shortcut Manager: Ctrl+N (New Chat), Ctrl+K (Search/Command Palette), Esc (Close active modals)
  useGlobalKeyboardShortcuts({
    onNewChat: () => {
      setCommandPaletteOpen(false);
      setShortcutsModalOpen(false);
      setLiveVoiceOpen(false);
      setJazzCashModal({ isOpen: false, plan: 'pro' });
      handleNewChat();
    },
    onOpenSearch: () => {
      setShortcutsModalOpen(false);
      setCommandPaletteOpen(true);
    },
    onCloseModals: () => {
      if (commandPaletteOpen) {
        setCommandPaletteOpen(false);
        return;
      }
      if (shortcutsModalOpen) {
        setShortcutsModalOpen(false);
        return;
      }
      if (liveVoiceOpen) {
        setLiveVoiceOpen(false);
        return;
      }
      if (jazzCashModal.isOpen) {
        setJazzCashModal({ isOpen: false, plan: 'pro' });
        return;
      }
    },
    onToggleSidebar: () => {
      setSidebarCollapsed((prev) => !prev);
    },
    onOpenShortcutsHelp: () => {
      setCommandPaletteOpen(false);
      setShortcutsModalOpen(true);
    },
  });

  // Modals component
  const modals = (
    <>
      <LiveVoiceModal
        isOpen={liveVoiceOpen}
        onClose={() => setLiveVoiceOpen(false)}
        defaultLanguage={language}
      />
      <JazzCashModal
        isOpen={jazzCashModal.isOpen}
        onClose={() => setJazzCashModal({ isOpen: false, plan: 'pro' })}
        plan={jazzCashModal.plan}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        conversations={conversations}
        onSelectConversation={handleSelectConv}
        onNewChat={handleNewChat}
        onNavigate={setCurrentView}
        onOpenLiveVoice={() => setLiveVoiceOpen(true)}
        onOpenShortcutsHelp={() => setShortcutsModalOpen(true)}
      />
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </>
  );

  // Router rendering
  if (currentView === 'seo-abdullah-brand') {
    return (
      <>
        <AbdullahHackerSEOView
          onNavigateToApp={(view) => handleNavigate((view as ViewMode) || 'dashboard-chat')}
        />
        {modals}
      </>
    );
  }

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onNavigate={handleNavigate}
          onQuickPrompt={handleQuickPrompt}
          onOpenJazzCash={(plan) => setJazzCashModal({ isOpen: true, plan })}
          onOpenLiveVoice={() => setLiveVoiceOpen(true)}
        />
        {modals}
      </>
    );
  }

  if (currentView === 'auth-login' || currentView === 'auth-signup') {
    return (
      <>
        <AuthView
          initialMode={currentView === 'auth-signup' ? 'signup' : 'login'}
          onSuccess={handleAuthSuccess}
          onNavigateLanding={() => handleNavigate('landing')}
        />
        {modals}
      </>
    );
  }

  // Dashboard views wrapped in AppLayout
  return (
    <>
      <AppLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        currentLanguage={language}
        onOpenLiveCall={() => setLiveVoiceOpen(true)}
        conversations={conversations}
        activeConvId={activeConvId}
        onSelectConv={handleSelectConv}
        onNewChat={handleNewChat}
        onDeleteConv={handleDeleteConv}
        onOpenJazzCash={(plan) => setJazzCashModal({ isOpen: true, plan })}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onOpenShortcutsHelp={() => setShortcutsModalOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      >
        {currentView === 'dashboard-chat' && (
          <ChatView
            currentLanguage={language}
            onSaveToLibrary={handleSaveToLibrary}
            onOpenLiveVoice={() => setLiveVoiceOpen(true)}
            onNavigateView={setCurrentView}
            conversations={conversations}
            activeConvId={activeConvId}
            onUpdateConversations={(updated) => {
              setConversations(updated);
              localStorage.setItem('thinkpulse_conversations', JSON.stringify(updated));
              syncConversationsToServer(updated);
            }}
            onNewChat={handleNewChat}
            user={user}
            onSelectConv={handleSelectConv}
            onDeleteConv={handleDeleteConv}
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          />
        )}

        {currentView === 'dashboard-sport' && (
          <SportTeamAIView
            currentLanguage={language}
            onOpenLiveVoice={() => setLiveVoiceOpen(true)}
          />
        )}

        {currentView === 'dashboard-website' && (
          <WebsiteBuilderView
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-app' && (
          <AppBuilderView
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-image' && (
          <ImageStudioView
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-video' && (
          <VideoStudioView
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-music' && (
          <MusicStudioView
            user={user}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-transcribe' && (
          <AudioTranscribeView
            user={user}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-voice' && (
          <VoiceStudioView
            currentLanguage={language}
            onSaveToLibrary={handleSaveToLibrary}
            onOpenLiveCall={() => setLiveVoiceOpen(true)}
          />
        )}

        {currentView === 'dashboard-docs' && (
          <DocumentAIView
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {currentView === 'dashboard-library' && (
          <LibraryView
            items={libraryItems}
            onDeleteItem={handleDeleteLibraryItem}
          />
        )}

        {(currentView === 'dashboard-support' || currentView === 'dashboard-settings') && (
          <SupportSettingsView
            user={user}
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        )}

        {(currentView === 'dashboard-profile' || currentView === 'dashboard-my-payments') && (
          <UserProfileView
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('thinkpulse_user', JSON.stringify(updated));
            }}
            onNavigate={setCurrentView}
            onLogout={handleLogout}
            onOpenJazzCash={(plan) =>
              setJazzCashModal({
                isOpen: true,
                plan: (typeof plan === 'string' && (plan === 'pro' || plan === 'enterprise')) ? plan : 'pro',
              })
            }
          />
        )}

        {currentView === 'dashboard-pricing' && (
          <PricingView
            user={user}
            onNavigate={setCurrentView}
            onSelectPlan={(plan) =>
              setJazzCashModal({
                isOpen: true,
                plan: (plan.id === 'enterprise' ? 'enterprise' : 'pro'),
              })
            }
          />
        )}

        {currentView === 'dashboard-domains' && (
          <DomainsView
            user={user}
            onNavigateAuth={() => handleNavigate('auth-login')}
          />
        )}

        {currentView === 'dashboard-admin' && (
          (user && (user.role === 'admin' || user.email?.toLowerCase().trim() === 'abdullah106556661@gmail.com')) ? (
            <AdminPortalView
              currentUser={user}
              onUpdateCurrentUser={(updated) => {
                setUser(updated);
                localStorage.setItem('thinkpulse_user', JSON.stringify(updated));
              }}
              onNavigateChat={() => setCurrentView('dashboard-chat')}
            />
          ) : (
            <AdminUnlockCard
              onSuccess={(adminUser) => {
                setUser(adminUser);
                localStorage.setItem('thinkpulse_user', JSON.stringify(adminUser));
              }}
              onCancel={() => setCurrentView('dashboard-chat')}
            />
          )
        )}
      </AppLayout>
      {modals}
    </>
  );
}

function AdminUnlockCard({
  onSuccess,
  onCancel,
}: {
  onSuccess: (adminUser: User) => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('1065566b');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (passToUse?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'abdullah106556661@gmail.com',
          password: passToUse || password,
          rememberMe: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate administrator');

      localStorage.setItem('thinkpulse_token', data.token);
      localStorage.setItem('thinkpulse_auth_token', data.token);
      localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify master password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#07090e]">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-xl shadow-amber-950/40">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white font-heading">Super Administrator Portal</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Authentication required for master administrator <span className="text-amber-400 font-mono font-bold">abdullah106556661@gmail.com</span>.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left">
            {error}
          </div>
        )}

        <div className="space-y-3 text-left">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              readOnly
              value="abdullah106556661@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => handleUnlock()}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Unlock Master Admin Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
