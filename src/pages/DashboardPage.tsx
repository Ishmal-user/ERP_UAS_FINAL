/**
 * Hotel Arunika Senja ERP - Dashboard Page
 * Dispatches to role-specific dashboard views based on authenticated user credentials.
 */

import React from 'react';
import { NavItemKey } from '../components/layout/Sidebar';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';

interface DashboardPageProps {
  onNavigate: (page: NavItemKey) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  return <RoleDashboard onNavigate={onNavigate} />;
};
