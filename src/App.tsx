/**
 * Hotel Arunika Senja ERP - Main Application Shell
 * Complete Role-Based Access Control and Navigation System.
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { canAccessPage, ROLE_CONFIGS } from './config/rolePermissions';
import { AccessDeniedView } from './components/common/AccessDeniedView';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AppsHubPage } from './pages/AppsHubPage';
import { DashboardPage } from './pages/DashboardPage';
import { MasterDataPage } from './pages/MasterDataPage';
import { FrontDeskPage } from './pages/FrontDeskPage';
import { BookingsPage } from './pages/BookingsPage';
import { SalesCRMPage } from './pages/SalesCRMPage';
import { PurchasePage } from './pages/PurchasePage';
import { InventoryPage } from './pages/InventoryPage';
import { InvoicingPage } from './pages/InvoicingPage';
import { AccountingPage } from './pages/AccountingPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser } = useERP();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activePage, setActivePage] = useState<NavItemKey>('dashboard');

  // Global Booking Modal state
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [preselectedRoomForBooking, setPreselectedRoomForBooking] = useState<string | undefined>(undefined);

  // If user signed out, display Login page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={(role) => {
          setIsLoggedIn(true);
          const config = ROLE_CONFIGS[role];
          setActivePage(config?.defaultPage || 'dashboard');
        }}
      />
    );
  }

  const handleOpenBookingModal = (roomId?: string) => {
    setPreselectedRoomForBooking(roomId);
    setIsNewBookingModalOpen(true);
  };

  // Enforce Role-Based Page Access
  const isPagePermitted = canAccessPage(currentUser.role, activePage);

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-[#1E293B] font-sans antialiased overflow-hidden selection:bg-[#FBF4E4] selection:text-[#0B2342]">
      {/* Left Sidebar - Dynamically filtered to permitted menus only */}
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        onSignOut={() => setIsLoggedIn(false)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navigation with Avatar, Role Chip, and 7-Role Switcher */}
        <TopNavbar
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
        />

        {/* Content Viewport with Permission Guard */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {!isPagePermitted ? (
              <AccessDeniedView
                attemptedPage={activePage}
                onNavigate={(page) => setActivePage(page)}
              />
            ) : (
              <>
                {activePage === 'apps' && (
                  <AppsHubPage onNavigate={(page) => setActivePage(page)} />
                )}

                {activePage === 'dashboard' && (
                  <DashboardPage onNavigate={(page) => setActivePage(page)} />
                )}

                {activePage === 'master-data' && (
                  <MasterDataPage onNavigate={(page) => setActivePage(page)} />
                )}

                {activePage === 'front-desk' && (
                  <FrontDeskPage
                    onNavigate={(page) => setActivePage(page)}
                    onOpenNewBookingModal={handleOpenBookingModal}
                  />
                )}

                {activePage === 'bookings' && (
                  <BookingsPage
                    onNavigate={(page) => setActivePage(page)}
                    isCreateModalOpen={isNewBookingModalOpen}
                    onCloseCreateModal={() => {
                      setIsNewBookingModalOpen(false);
                      setPreselectedRoomForBooking(undefined);
                    }}
                    onOpenCreateModal={handleOpenBookingModal}
                    preselectedRoomId={preselectedRoomForBooking}
                  />
                )}

                {activePage === 'sales-crm' && <SalesCRMPage />}

                {activePage === 'purchase' && <PurchasePage />}

                {activePage === 'inventory' && <InventoryPage />}

                {activePage === 'invoicing' && <InvoicingPage />}

                {activePage === 'accounting' && <AccountingPage />}

                {activePage === 'reports' && <ReportsPage />}

                {activePage === 'audit-log' && <AuditLogPage />}

                {activePage === 'settings' && <SettingsPage />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Booking Modal if triggered from Front Desk or other page */}
      {isNewBookingModalOpen && activePage !== 'bookings' && (
        <BookingsPage
          onNavigate={(page) => setActivePage(page)}
          isCreateModalOpen={isNewBookingModalOpen}
          onCloseCreateModal={() => {
            setIsNewBookingModalOpen(false);
            setPreselectedRoomForBooking(undefined);
          }}
          onOpenCreateModal={handleOpenBookingModal}
          preselectedRoomId={preselectedRoomForBooking}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <AppContent />
    </ERPProvider>
  );
}
