import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';
import { TopBar, AppViewMode } from './components/layout/TopBar';
import { DeviceFrame } from './components/layout/DeviceFrame';
import { AndroidStatusBar } from './components/android/AndroidStatusBar';
import { BottomNavigation, AndroidTab } from './components/android/navigation/BottomNavigation';
import { AuthView } from './components/android/auth/AuthView';
import { ChatListView } from './components/android/chats/ChatListView';
import { ChatConversationView } from './components/android/chats/ChatConversationView';
import { ContactsView } from './components/android/contacts/ContactsView';
import { CallsView } from './components/android/calls/CallsView';
import { GroupsView } from './components/android/groups/GroupsView';
import { ProfileView } from './components/android/profile/ProfileView';
import { SettingsView } from './components/android/settings/SettingsView';
import { ActiveCallModal } from './components/android/calls/ActiveCallModal';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { CodeExplorerView } from './components/codeExplorer/CodeExplorerView';
import { DeploymentDocsView } from './components/docs/DeploymentDocsView';

const MessengerAppContent: React.FC<{ onNavigateToContacts: () => void }> = ({ onNavigateToContacts }) => {
  const { user, isAuthenticated } = useAuth();
  const { activeConversation, setActiveConversation } = useChat();
  const [activeTab, setActiveTab] = useState<AndroidTab>('chats');

  if (!isAuthenticated || !user) {
    return <AuthView />;
  }

  // If in an active conversation, display full conversation view
  if (activeConversation) {
    return (
      <ChatConversationView
        conversation={activeConversation}
        onBack={() => setActiveConversation(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chats' && (
          <ChatListView
            onSelectConversation={(conv) => setActiveConversation(conv)}
            onOpenNewChatModal={() => setActiveTab('contacts')}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsView
            onStartChatWithUser={() => {
              setActiveTab('chats');
            }}
          />
        )}

        {activeTab === 'calls' && <CallsView />}

        {activeTab === 'groups' && (
          <GroupsView
            onSelectGroup={(group) => {
              setActiveConversation(group);
            }}
          />
        )}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'settings' && <SettingsView />}
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveConversation(null);
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppViewMode>('app');
  const { isAdminAuthenticated } = useAdmin();
  const { activeCall } = useChat();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Universal Top Navigation */}
      <TopBar currentView={currentView} onSelectView={setCurrentView} />

      {/* Direct Project Archive Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-indigo-900/60 border-b border-purple-500/30 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">📦 ConnectX Full Project Bundle:</span>
          <span>Actual Android Kotlin source files, Jetpack Compose UI, Admin Panel, and Firebase rules</span>
        </div>
        <a
          href="/connectx_messenger_full_project.zip"
          download="connectx_messenger_full_project.zip"
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download connectx_messenger_full_project.zip (34.3 KB)</span>
        </a>
      </div>

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'app' && (
          <DeviceFrame>
            <AndroidStatusBar />
            <MessengerAppContent onNavigateToContacts={() => {}} />
            {/* Real WebRTC Call Modal Overlay */}
            {activeCall && <ActiveCallModal />}
          </DeviceFrame>
        )}

        {currentView === 'admin' && (
          <>{isAdminAuthenticated ? <AdminDashboardView /> : <AdminLoginView />}</>
        )}

        {currentView === 'code' && <CodeExplorerView />}

        {currentView === 'docs' && <DeploymentDocsView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
