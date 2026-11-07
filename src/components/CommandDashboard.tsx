import React from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  GraduationCap,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building,
} from 'lucide-react';
import {
  Personnel,
  Unit,
  DutyAssignment,
  AttendanceRecord,
  WelfareRequest,
  OfficialAnnouncement,
} from '../types/commander';
import { NavTab } from './Navigation';

interface CommandDashboardProps {
  personnel: Personnel[];
  units: Unit[];
  dutyAssignments: DutyAssignment[];
  attendanceRecords: AttendanceRecord[];
  welfareRequests: WelfareRequest[];
  announcements: OfficialAnnouncement[];
  onNavigate: (tab: NavTab) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  currentEchelonLabel: string;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  personnel,
  units,
  dutyAssignments,
  attendanceRecords,
  welfareRequests,
  announcements,
  onNavigate,
  onApproveRequest,
  onRejectRequest,
  currentEchelonLabel,
}) => {
  // Statistics computations
  const totalCount = personnel.length;
  const availableCount = personnel.filter((p) => p.status === 'AVAILABLE').length;
  const leaveCount = personnel.filter((p) => p.status === 'LEAVE').length;
  const trainingCount = personnel.filter((p) => p.status === 'TRAINING').length;
  const unavailableCount = personnel.filter((p) => p.status === 'UNAVAILABLE').length;
  const attentionCount = personnel.filter((p) => p.status === 'PENDING_REVIEW').length;

  const readinessPercent = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 100;
  const pendingRequests = welfareRequests.filter((r) => r.status === 'PENDING');

  // Today's active duty shifts
  const todayStr = '2026-11-07';
  const todayDuties = dutyAssignments.filter((d) => d.date === todayStr);

  const getPersonnelName = (id: string) => {
    const p = personnel.find((pers) => pers.id === id);
    return p ? `${p.rank} ${p.lastName}` : 'Unassigned';
  };

  const getUnitName = (id: string) => {
    const u = units.find((unit) => unit.id === id);
    return u ? u.shortName : 'Unit';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Scope Confirmation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/30">
              ACTIVE COMMAND SCOPE
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Echelon: <strong className="text-slate-200">{currentEchelonLabel}</strong>
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-heading font-bold text-slate-100 mt-1">
            Personnel Readiness & Operational Accountability Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time administrative posture, duty rosters, strength status (PERSTAT), and command actions.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/70 px-4 py-2.5 rounded-lg border border-slate-800">
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase font-mono">Unit Health</div>
            <div className="text-xl font-bold font-heading text-emerald-400">{readinessPercent}%</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase font-mono">Accountability</div>
            <div className="text-xl font-bold font-heading text-blue-400">100%</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase font-mono">Open Actions</div>
            <div className="text-xl font-bold font-heading text-amber-400">{pendingRequests.length}</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Assigned */}
        <div
          onClick={() => onNavigate('personnel')}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-mono">TOTAL ASSIGNED</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-100">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% on roster</div>
        </div>

        {/* Available for Duty */}
        <div
          onClick={() => onNavigate('personnel')}
          className="bg-emerald-950/20 border border-emerald-900/40 hover:border-emerald-600/50 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span className="font-mono">AVAILABLE (FIT)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-300">{availableCount}</div>
          <div className="text-[11px] text-emerald-500/90 mt-1">
            {totalCount ? Math.round((availableCount / totalCount) * 100) : 0}% ready for duty
          </div>
        </div>

        {/* Approved Leave */}
        <div
          onClick={() => onNavigate('duty')}
          className="bg-blue-950/20 border border-blue-900/40 hover:border-blue-600/50 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-blue-400 text-xs mb-1">
            <span className="font-mono">APPROVED LEAVE</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-blue-300">{leaveCount}</div>
          <div className="text-[11px] text-blue-400/80 mt-1">Authorized passes</div>
        </div>

        {/* Attending Training */}
        <div
          onClick={() => onNavigate('training')}
          className="bg-purple-950/20 border border-purple-900/40 hover:border-purple-600/50 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-purple-400 text-xs mb-1">
            <span className="font-mono">TRAINING / TDY</span>
            <GraduationCap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-purple-300">{trainingCount}</div>
          <div className="text-[11px] text-purple-400/80 mt-1">Schools & Courses</div>
        </div>

        {/* Temporarily Unavailable */}
        <div
          onClick={() => onNavigate('welfare')}
          className="bg-amber-950/20 border border-amber-900/40 hover:border-amber-600/50 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span className="font-mono">MEDICAL / SIQ</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-amber-300">{unavailableCount}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">Clinic quarters</div>
        </div>

        {/* Pending Review / Overdue */}
        <div
          onClick={() => onNavigate('training')}
          className="bg-rose-950/20 border border-rose-900/40 hover:border-rose-600/50 p-3.5 rounded-lg cursor-pointer transition group shadow"
        >
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span className="font-mono">ACTION REQUIRED</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-rose-300">{attentionCount}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Overdue ACFT / record</div>
        </div>
      </div>

      {/* Action Banners & Pending Approvals Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-amber-200 text-sm">
                PENDING COMMAND DECISIONS ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('welfare')}
              className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 cursor-pointer font-medium"
            >
              View Welfare Portal <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const soldier = personnel.find((p) => p.id === req.personnelId);
              return (
                <div
                  key={req.id}
                  className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      {soldier ? `${soldier.rank} ${soldier.lastName}, ${soldier.firstName}` : 'Soldier'} —{' '}
                      <span className="text-amber-300 uppercase font-mono">{req.type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{req.reason}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApproveRequest(req.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition cursor-pointer"
                    >
                      Authorize
                    </button>
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded text-xs transition cursor-pointer border border-slate-700"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Duties & Muster + Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's On-Duty Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Duty Schedule Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-heading font-semibold text-slate-100 text-sm">
                  TODAY&apos;S DUTY ROSTER & SHIFT APPOINTMENTS
                </h3>
              </div>
              <button
                onClick={() => onNavigate('duty')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                Full Calendar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayDuties.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">No active duty shifts scheduled for today.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Duty Assignment</th>
                      <th className="py-2 px-3">Primary Assigned</th>
                      <th className="py-2 px-3">Alternate</th>
                      <th className="py-2 px-3">Shift Hours</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {todayDuties.map((duty) => (
                      <tr key={duty.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {duty.shiftType.replace('OD_', '').replace('SDO_', '').replace('CQ_', '').replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-mono">
                          {getPersonnelName(duty.primaryPersonnelId)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {getPersonnelName(duty.alternatePersonnelId)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {duty.timeStart} - {duty.timeEnd}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              duty.status === 'ON_DUTY'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {duty.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subordinate Unit Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <h3 className="font-heading font-semibold text-slate-100 text-sm">
                  SUBORDINATE UNIT STRENGTH & READINESS
                </h3>
              </div>
              <button
                onClick={() => onNavigate('hierarchy')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Org Hierarchy <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {units.map((u) => {
                const assigned = personnel.filter((p) => p.unitId === u.id).length;
                const available = personnel.filter((p) => p.unitId === u.id && p.status === 'AVAILABLE').length;
                const unitReadiness = assigned > 0 ? Math.round((available / assigned) * 100) : 100;

                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{u.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                        {u.echelon}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      CDR: {u.commanderRank} {u.commanderName}
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                        <span>Strength: {assigned} Assigned</span>
                        <span className="text-emerald-400 font-semibold">{unitReadiness}% Ready</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${unitReadiness}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Directives & Quick Administrative Actions */}
        <div className="space-y-6">
          {/* Official Announcements / Directives */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-heading font-semibold text-slate-100 text-sm">
                  COMMAND DIRECTIVES
                </h3>
              </div>
              <button
                onClick={() => onNavigate('comms')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        item.priority === 'URGENT'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : item.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.publishedDate}</span>
                  </div>
                  <div className="font-semibold text-slate-200 line-clamp-1">{item.title}</div>
                  <div className="text-slate-400 text-[11px] mt-1 line-clamp-2">{item.content}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    AUTH: {item.authorRankName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Commander Action Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
            <h3 className="font-heading font-semibold text-slate-100 text-sm mb-3">
              EXPEDITED ADMINISTRATION
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('attendance')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-semibold text-emerald-400">Morning Muster</div>
                <div className="text-[10px] text-slate-400 mt-1">Record roll call & absences</div>
              </button>

              <button
                onClick={() => onNavigate('duty')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-semibold text-blue-400">Shift Handover</div>
                <div className="text-[10px] text-slate-400 mt-1">Digital logbook sign-off</div>
              </button>

              <button
                onClick={() => onNavigate('logistics')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-semibold text-purple-400">Equipment Audit</div>
                <div className="text-[10px] text-slate-400 mt-1">Inspect hand receipts</div>
              </button>

              <button
                onClick={() => onNavigate('personnel')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition cursor-pointer"
              >
                <div className="font-semibold text-amber-400">Add Soldier</div>
                <div className="text-[10px] text-slate-400 mt-1">Register military record</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
