import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  return (
    <LanguageProvider>
      <AppLayoutInner />
    </LanguageProvider>
  );
}

function AppLayoutInner() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar — gets a hamburger button for mobile */}
        <Topbar onMenuClick={() => setMobileOpen(true)} user={user} />

        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Default export for Topbar's mobile menu trigger if needed elsewhere
export { AppLayoutInner };
