import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Bot,
  Printer,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../types/commander';
import { ROLE_DEFINITIONS } from '../utils/roleAccess';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenAiAssistant: () => void;
  onOpenReportModal: () => void;
  onQuickMuster: () => void;
  readinessRate: number;
  totalPersonnel: number;
  availablePersonnel: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenAiAssistant,
  onOpenReportModal,
  onQuickMuster,
  readinessRate,
  totalPersonnel,
  availablePersonnel,
}) => {
  const [zuluTime, setZuluTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      // Zulu (UTC)
      const zHours = String(now.getUTCHours()).padStart(2, '0');
      const zMins = String(now.getUTCMinutes()).padStart(2, '0');
      const zSecs = String(now.getUTCSeconds()).padStart(2, '0');
      setZuluTime(`${zHours}${zMins}:${zSecs}Z`);

      // Local military format
      const lHours = String(now.getHours()).padStart(2, '0');
      const lMins = String(now.getMinutes()).padStart(2, '0');
      const lSecs = String(now.getSeconds()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = now.getFullYear();
      setLocalTime(`${day} ${month} ${year} • ${lHours}${lMins}:${lSecs}L`);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentRoleInfo = ROLE_DEFINITIONS[currentRole];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner / Security Header */}
      <div className="bg-slate-950 px-4 py-1 flex items-center justify-between text-xs border-b border-slate-800/80 font-code tracking-wider text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            DEFCON 4 // ADMINISTRATIVE SECURE STATUS
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            ZULU: <span className="text-amber-300 font-bold">{zuluTime}</span>
          </span>
          <span className="hidden lg:inline text-slate-400">
            LOCAL: <span className="text-slate-200">{localTime}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-semibold">
            READINESS: {readinessRate}% GREEN
          </span>
          <span className="hidden sm:inline text-slate-400">
            STRENGTH: <span className="text-emerald-400 font-bold">{availablePersonnel}</span>/{totalPersonnel} FIT
          </span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-lg md:text-xl tracking-wider text-slate-100">
                COMMANDER <span className="text-emerald-400">360</span>
              </h1>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-code px-1.5 py-0.5 rounded border border-slate-700">
                v4.2-AUTH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
              Military Personnel & Unit Administration Platform
            </p>
          </div>
        </div>

        {/* Center / Right Controls: Role Switcher & Tactical Actions */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          {/* Quick Muster Button */}
          <button
            onClick={onQuickMuster}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            title="Open Morning Roll Call Muster"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Daily</span> Muster
          </button>

          {/* Official Report Print Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            title="Generate Official Military PERSTAT Report & Export"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Official</span> Report
          </button>

          {/* AI Commander Assistant Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/40 transition cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-100" />
            <span>AI Advisor</span>
          </button>

          {/* Scoped Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-950 border border-emerald-600/40 text-left hover:border-emerald-500 text-xs transition cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Current Echelon Lens</div>
                <div className="font-semibold text-slate-200 flex items-center gap-1">
                  {currentRoleInfo.label}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">Select Commander Echelon</div>
                  <div className="text-[11px] text-slate-400">
                    Switches administrative scope & authority permissions
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => {
                    const item = ROLE_DEFINITIONS[r];
                    const isSelected = r === currentRole;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          onRoleChange(r);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition flex items-start gap-2 ${
                          isSelected
                            ? 'bg-emerald-950/60 text-emerald-300 font-medium'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{item.label}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{item.rankTitle}</div>
                          <div className="text-[10px] text-slate-500">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
