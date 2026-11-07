import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Plus,
  ShieldAlert,
  CheckCircle,
  FileEdit,
  UserCheck,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { DutyAssignment, Personnel, Unit, ShiftType } from '../types/commander';

interface DutyManagementProps {
  dutyAssignments: DutyAssignment[];
  personnel: Personnel[];
  units: Unit[];
  canAssign: boolean;
  onAddDuty: (duty: Omit<DutyAssignment, 'id'>) => void;
  onUpdateDutyStatus: (dutyId: string, status: DutyAssignment['status'], handoverNotes?: string) => void;
}

export const DutyManagement: React.FC<DutyManagementProps> = ({
  dutyAssignments,
  personnel,
  units,
  canAssign,
  onAddDuty,
  onUpdateDutyStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-07');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [isAddDutyOpen, setIsAddDutyOpen] = useState(false);
  const [handoverDuty, setHandoverDuty] = useState<DutyAssignment | null>(null);
  const [handoverNotes, setHandoverNotes] = useState('');

  // Add duty form state
  const [newDate, setNewDate] = useState('2026-11-08');
  const [newShiftType, setNewShiftType] = useState<ShiftType>('SDO_STAFF_DUTY_OFFICER');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newPrimaryId, setNewPrimaryId] = useState(personnel[0]?.id || '');
  const [newAlternateId, setNewAlternateId] = useState(personnel[1]?.id || '');
  const [newTimeStart, setNewTimeStart] = useState('08:00');
  const [newTimeEnd, setNewTimeEnd] = useState('08:00');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Check for potential conflicts when selecting personnel
  const handlePrimaryChange = (persId: string) => {
    setNewPrimaryId(persId);
    const soldier = personnel.find((p) => p.id === persId);
    if (soldier?.status === 'LEAVE') {
      setConflictWarning(`CONFLICT: ${soldier.rank} ${soldier.lastName} is currently on approved leave.`);
    } else if (soldier?.status === 'UNAVAILABLE') {
      setConflictWarning(`CONFLICT: ${soldier.rank} ${soldier.lastName} has medical convalescent profile / quarters.`);
    } else {
      setConflictWarning(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrimaryId === newAlternateId) {
      alert('Primary and Alternate duty personnel cannot be the same individual.');
      return;
    }

    onAddDuty({
      date: newDate,
      shiftType: newShiftType,
      unitId: newUnitId,
      primaryPersonnelId: newPrimaryId,
      alternatePersonnelId: newAlternateId,
      status: 'SCHEDULED',
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
    });

    setIsAddDutyOpen(false);
    setConflictWarning(null);
  };

  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverDuty) return;

    onUpdateDutyStatus(handoverDuty.id, 'COMPLETED', handoverNotes);
    setHandoverDuty(null);
    setHandoverNotes('');
  };

  // Filter assignments
  const filteredAssignments = dutyAssignments.filter((d) => {
    const matchesDate = !selectedDate || d.date === selectedDate;
    const matchesShift = shiftFilter === 'ALL' || d.shiftType === shiftFilter;
    return matchesDate && matchesShift;
  });

  const getPersonnel = (id: string) => personnel.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            DUTY SCHEDULE & SHIFT ACCOUNTABILITY MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Officer of the Day, Staff Duty, Charge of Quarters (CQ), and armory security rosters.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-mono"
            />
          </div>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-emerald-500"
          >
            <option value="ALL">All Duty Shifts</option>
            <option value="OD_OFFICER_OF_DAY">Officer of the Day (OD)</option>
            <option value="SDO_STAFF_DUTY_OFFICER">Staff Duty Officer (SDO)</option>
            <option value="CQ_CHARGE_OF_QUARTERS">Charge of Quarters (CQ)</option>
            <option value="ARMORY_GUARD">Armory Guard</option>
            <option value="GATE_SENTRY">Gate Sentry</option>
            <option value="VEHICLE_INSPECTION">Vehicle Inspection</option>
            <option value="FIRE_WATCH">Fire Watch</option>
          </select>

          {canAssign && (
            <button
              onClick={() => setIsAddDutyOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Duty</span>
            </button>
          )}
        </div>
      </div>

      {/* Duty Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-slate-100 text-sm">
            ACTIVE APPOINTMENTS FOR {selectedDate || 'ALL DATES'} ({filteredAssignments.length} ASSIGNMENTS)
          </h3>
          <span className="text-xs text-slate-400 font-mono">24-Hour Accountability Log</span>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No duty appointments found for the specified date and filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Shift & Hours</th>
                  <th className="py-3 px-4">Primary Appointee</th>
                  <th className="py-3 px-4">Alternate Standby</th>
                  <th className="py-3 px-4">Assigned Unit</th>
                  <th className="py-3 px-4">Shift Status</th>
                  <th className="py-3 px-4">Turnover Log</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAssignments.map((duty) => {
                  const primary = getPersonnel(duty.primaryPersonnelId);
                  const alternate = getPersonnel(duty.alternatePersonnelId);
                  const unit = units.find((u) => u.id === duty.unitId);

                  return (
                    <tr key={duty.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {duty.shiftType.replace('OD_', '').replace('SDO_', '').replace('CQ_', '').replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{duty.timeStart} — {duty.timeEnd}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {primary ? (
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1">
                              <span className="text-emerald-400 font-mono">{primary.rank}</span>
                              <span>{primary.lastName}, {primary.firstName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{primary.dutyPosition}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {alternate ? (
                          <div>
                            <div className="text-slate-300 font-mono">
                              {alternate.rank} {alternate.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500">{alternate.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {unit?.shortName || 'Unit'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            duty.status === 'ON_DUTY'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : duty.status === 'COMPLETED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {duty.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-400 italic line-clamp-1">
                          {duty.handoverNotes || 'Log pending shift turnover.'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {duty.status === 'SCHEDULED' && (
                          <button
                            onClick={() => onUpdateDutyStatus(duty.id, 'ON_DUTY')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition cursor-pointer"
                          >
                            Check-In
                          </button>
                        )}

                        {duty.status === 'ON_DUTY' && (
                          <button
                            onClick={() => {
                              setHandoverDuty(duty);
                              setHandoverNotes(duty.handoverNotes || '');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Handover</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Handover & Relief Modal */}
      {handoverDuty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              OFFICIAL SHIFT TURNOVER & RELIEF LOGBOOK
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Record handover log, armory keys, physical security checks, and relieving signature.
            </p>

            <form onSubmit={handleHandoverSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Shift Handover Remarks</label>
                <textarea
                  rows={4}
                  required
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Record weapon counts, perimeter checks, visitors logged, and key transfers..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-400 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Relieving Officer Verified</span>
                </div>
                <div>All armory seals and sensitive items physically accounted for.</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setHandoverDuty(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Certify Handover & Relieve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Duty Modal */}
      {isAddDutyOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-heading font-bold text-slate-100 text-base">
                SCHEDULE MILITARY DUTY ASSIGNMENT
              </h3>
              <button
                onClick={() => setIsAddDutyOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Duty Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Shift Type</label>
                  <select
                    value={newShiftType}
                    onChange={(e) => setNewShiftType(e.target.value as ShiftType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="OD_OFFICER_OF_DAY">Officer of the Day (OD)</option>
                    <option value="SDO_STAFF_DUTY_OFFICER">Staff Duty Officer (SDO)</option>
                    <option value="CQ_CHARGE_OF_QUARTERS">Charge of Quarters (CQ)</option>
                    <option value="ARMORY_GUARD">Armory Guard</option>
                    <option value="GATE_SENTRY">Gate Sentry</option>
                    <option value="VEHICLE_INSPECTION">Vehicle Inspection</option>
                    <option value="FIRE_WATCH">Fire Watch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Responsible Unit</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Primary Appointed Soldier</label>
                <select
                  value={newPrimaryId}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              {conflictWarning && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-mono mb-1">Alternate Standby Soldier</label>
                <select
                  value={newAlternateId}
                  onChange={(e) => setNewAlternateId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Start Time (Military)</label>
                  <input
                    type="text"
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    placeholder="08:00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">End Time (Military)</label>
                  <input
                    type="text"
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    placeholder="20:00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDutyOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Authorize Duty Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
