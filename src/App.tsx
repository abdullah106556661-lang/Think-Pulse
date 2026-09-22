import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ViewMode, User, SupportedLanguage, GeneratedWebsiteProject, Conversation } from './types';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { AppLayout } from './components/AppLayout';
import { ChatView } from './components/ChatView';
import { WebsiteBuilderView } from './components/WebsiteBuilderView';
import { AppBuilderView } from './components/AppBuilderView';
import { ImageStudioView } from './components/ImageStudioView';
import { VideoStudioView } from './components/VideoStudioView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { DocumentAIView } from './components/DocumentAIView';
import { LibraryView } from './components/LibraryView';
import { SupportSettingsView } from './components/SupportSettingsView';
import { AdminPortalView } from './components/AdminPortalView';
import { UserProfileView } from './components/UserProfileView';
import { PricingView } from './components/PricingView';
import { SportTeamAIView } from './components/SportTeamAIView';
import { AbdullahHackerSEOView } from './components/AbdullahHackerSEOView';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { JazzCashModal } from './components/JazzCashModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';

export default function App() {
  // Default directly to ChatGPT interface or SEO brand page if URL matches
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/abdullah-55566-hacker')) {
      return 'seo-abdullah-brand';
    }
    return 'dashboard-chat';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/abdullah-55566-hacker')) {
        setCurrentView('seo-abdullah-brand');
      } else if (currentView === 'seo-abdullah-brand') {
        setCurrentView('dashboard-chat');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const handleNavigate = (view: ViewMode) => {
    if (view === 'seo-abdullah-brand') {
      window.history.pushState({}, '', '/abdullah-55566-hacker');
    } else if (window.location.pathname.startsWith('/abdullah-55566-hacker')) {
      window.history.pushState({}, '', '/');
    }
    setCurrentView(view);
  };
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('thinkpulse_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return {
      id: 'usr_super_admin',
      name: 'Abdullah (Super Admin)',
      email: 'abdullah106556661@gmail.com',
      plan: 'enterprise',
      role: 'admin',
      unlimited: true,
      unlimitedAccess: true,
      tokensRemaining: 999999999,
      createdAt: new Date().toISOString(),
    };
  });
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
      let token = localStorage.getItem('thinkpulse_token');
      if (!token) {
        token = 'thinkpulse_super_admin';
        localStorage.setItem('thinkpulse_token', 'thinkpulse_super_admin');
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('thinkpulse_user', JSON.stringify(data.user));
            return;
          }
        }
      } catch (e) {
        console.warn('Session sync from server warning:', e);
      }

      // Fallback to local storage if offline or during initial startup
      try {
        const savedUser = localStorage.getItem('thinkpulse_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Error loading session', e);
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
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setCurrentView('dashboard-chat');
  };

  const handleDeleteConv = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem('thinkpulse_conversations', JSON.stringify(updated));
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
      const demoUser: User = {
        id: 'usr_super_admin',
        email: 'abdullah106556661@gmail.com',
        name: 'Abdullah (Super Admin)',
        plan: 'enterprise',
        role: 'admin',
        unlimited: true,
        unlimitedAccess: true,
        tokensRemaining: 999999999,
        createdAt: new Date().toISOString(),
      };
      setUser(demoUser);
      localStorage.setItem('thinkpulse_user', JSON.stringify(demoUser));
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
            }}
            onNewChat={handleNewChat}
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

        {currentView === 'dashboard-support' && (
          <SupportSettingsView
            user={user}
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        )}

        {currentView === 'dashboard-profile' && (
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

        {currentView === 'dashboard-admin' && (
          user?.email?.toLowerCase().trim() === 'abdullah106556661@gmail.com' ? (
            <AdminPortalView
              currentUser={user}
              onUpdateCurrentUser={(updated) => {
                setUser(updated);
                localStorage.setItem('thinkpulse_user', JSON.stringify(updated));
              }}
              onNavigateChat={() => setCurrentView('dashboard-chat')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#07090e]">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-4 shadow-xl shadow-red-950/50">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">Access Denied</h2>
              <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
                The Admin Portal is strictly restricted to administrator <span className="text-amber-400 font-mono">abdullah106556661@gmail.com</span>. Non-admin users are not permitted to access this portal or its underlying API endpoints.
              </p>
              <button
                onClick={() => setCurrentView('dashboard-chat')}
                className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shadow-lg transition-colors cursor-pointer"
              >
                Return to Chat
              </button>
            </div>
          )
        )}
      </AppLayout>
      {modals}
    </>
  );
}
