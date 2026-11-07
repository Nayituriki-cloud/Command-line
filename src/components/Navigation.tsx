import React from 'react';
import {
  LayoutDashboard,
  Users,
  Network,
  CalendarCheck,
  UserCheck,
  GraduationCap,
  Package,
  HeartHandshake,
  Megaphone,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'personnel'
  | 'hierarchy'
  | 'duty'
  | 'attendance'
  | 'training'
  | 'logistics'
  | 'welfare'
  | 'comms';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  unacknowledgedNoticesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  unacknowledgedNoticesCount,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'personnel', label: 'Personnel Records', icon: Users },
    { id: 'hierarchy', label: 'Unit Hierarchy', icon: Network },
    { id: 'duty', label: 'Duty & Scheduling', icon: CalendarCheck },
    { id: 'attendance', label: 'Attendance & Muster', icon: UserCheck },
    { id: 'training', label: 'Training & Readiness', icon: GraduationCap },
    { id: 'logistics', label: 'Logistics & Inventory', icon: Package },
    {
      id: 'welfare',
      label: 'Personnel Welfare',
      icon: HeartHandshake,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'comms',
      label: 'Directives & Orders',
      icon: Megaphone,
      badge: unacknowledgedNoticesCount > 0 ? unacknowledgedNoticesCount : undefined,
    },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-[95px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none text-xs font-medium">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md whitespace-nowrap transition cursor-pointer font-heading tracking-wide ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
