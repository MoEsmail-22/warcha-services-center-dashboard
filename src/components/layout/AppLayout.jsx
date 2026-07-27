import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar — gets a hamburger button for mobile */}
        <Topbar onMenuClick={() => setMobileOpen(true)} user={user} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Default export for Topbar's mobile menu trigger if needed elsewhere
export { AppLayoutInner };
