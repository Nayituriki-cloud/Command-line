import React, { useState } from 'react';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { AttendanceRecord, Personnel, Unit } from '../types/commander';
import { exportToCsv } from '../utils/exportUtils';

interface AttendanceAccountabilityProps {
  personnel: Personnel[];
  units: Unit[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (recordId: string, status: AttendanceRecord['status'], remarks?: string) => void;
  onCheckInSoldier: (personnelId: string, unitId: string) => void;
}

export const AttendanceAccountability: React.FC<AttendanceAccountabilityProps> = ({
  personnel,
  units,
  attendanceRecords,
  onUpdateAttendance,
  onCheckInSoldier,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-07');
  const [selectedUnitId, setSelectedUnitId] = useState('ALL');

  // Filter records for the selected date
  const dateRecords = attendanceRecords.filter((r) => r.date === selectedDate);

  // Filtered personnel
  const displayedPersonnel = personnel.filter((p) => {
    return selectedUnitId === 'ALL' || p.unitId === selectedUnitId;
  });

  // Calculate statistics
  const totalMuster = displayedPersonnel.length;
  const presentCount = displayedPersonnel.filter((p) => {
    const rec = dateRecords.find((r) => r.personnelId === p.id);
    return rec ? rec.status === 'PRESENT' : p.status === 'AVAILABLE';
  }).length;

  const leaveCount = displayedPersonnel.filter((p) => {
    const rec = dateRecords.find((r) => r.personnelId === p.id);
    return rec ? rec.status === 'EXCUSED_LEAVE' : p.status === 'LEAVE';
  }).length;

  const medicalCount = displayedPersonnel.filter((p) => {
    const rec = dateRecords.find((r) => r.personnelId === p.id);
    return rec ? rec.status === 'MEDICAL_QUARTERS' : p.status === 'UNAVAILABLE';
  }).length;

  const trainingCount = displayedPersonnel.filter((p) => {
    const rec = dateRecords.find((r) => r.personnelId === p.id);
    return rec ? rec.status === 'EXCUSED_TRAINING' : p.status === 'TRAINING';
  }).length;

  const musterPercentage = totalMuster > 0 ? Math.round((presentCount / totalMuster) * 100) : 100;

  const handleExportCsv = () => {
    const headers = ['Service_ID', 'Rank', 'Last_Name', 'First_Name', 'Unit', 'Status', 'CheckIn_Time', 'Remarks'];
    const rows = displayedPersonnel.map((p) => {
      const rec = dateRecords.find((r) => r.personnelId === p.id);
      const unit = units.find((u) => u.id === p.unitId);
      return [
        p.serviceNumber,
        p.rank,
        p.lastName,
        p.firstName,
        unit?.shortName || '',
        rec?.status || p.status,
        rec?.checkInTime || '06:30',
        rec?.remarks || '',
      ];
    });

    exportToCsv(`PERSTAT_ATTENDANCE_${selectedDate}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            MORNING MUSTER & PERSONNEL ACCOUNTABILITY (ROLL CALL)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% daily accountability verification, authorized check-ins, and absence reporting.
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
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-emerald-500"
          >
            <option value="ALL">All Units (Muster Roll)</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.shortName} - {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* Accountability Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Muster Strength</div>
          <div className="text-xl font-bold font-heading text-slate-200 mt-1">{totalMuster}</div>
          <div className="text-[10px] text-slate-500">Personnel Assigned</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg text-center">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Present for Duty</div>
          <div className="text-xl font-bold font-heading text-emerald-300 mt-1">{presentCount}</div>
          <div className="text-[10px] text-emerald-500">{musterPercentage}% Formed</div>
        </div>

        <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-lg text-center">
          <div className="text-[10px] font-mono text-blue-400 uppercase">Authorized Leave</div>
          <div className="text-xl font-bold font-heading text-blue-300 mt-1">{leaveCount}</div>
          <div className="text-[10px] text-blue-500">Excused Absence</div>
        </div>

        <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded-lg text-center">
          <div className="text-[10px] font-mono text-purple-400 uppercase">Official Training</div>
          <div className="text-xl font-bold font-heading text-purple-300 mt-1">{trainingCount}</div>
          <div className="text-[10px] text-purple-500">TDY / Courses</div>
        </div>

        <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg text-center">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Medical / SIQ</div>
          <div className="text-xl font-bold font-heading text-amber-300 mt-1">{medicalCount}</div>
          <div className="text-[10px] text-amber-500">Clinic Quarters</div>
        </div>
      </div>

      {/* Muster Roll Call Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-slate-100 text-sm">
            DAILY ROLL CALL MUSTER SHEET — {selectedDate}
          </h3>
          <span className="text-xs text-emerald-400 font-mono">
            First Sergeant Accountability Certified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service ID</th>
                <th className="py-3 px-4">Soldier Name & Rank</th>
                <th className="py-3 px-4">Unit Assignment</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Accountability Status</th>
                <th className="py-3 px-4">Verifier / Remarks</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {displayedPersonnel.map((soldier) => {
                const rec = dateRecords.find((r) => r.personnelId === soldier.id);
                const unit = units.find((u) => u.id === soldier.unitId);
                const status = rec?.status || (soldier.status === 'AVAILABLE' ? 'PRESENT' : 'EXCUSED_LEAVE');

                return (
                  <tr key={soldier.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">{soldier.serviceNumber}</td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="text-emerald-400 font-mono">{soldier.rank}</span>
                        <span>{soldier.lastName}, {soldier.firstName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{soldier.dutyPosition}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {unit?.shortName || 'Unit'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {rec?.checkInTime ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{rec.checkInTime} hrs</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Not Formed</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          status === 'PRESENT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : status === 'EXCUSED_LEAVE'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : status === 'EXCUSED_TRAINING'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : status === 'MEDICAL_QUARTERS'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] italic max-w-xs">
                      {rec?.remarks || rec?.verifiedBy ? `Verified: ${rec?.verifiedBy || ''} ${rec?.remarks || ''}` : 'Daily muster'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!rec?.checkInTime ? (
                        <button
                          onClick={() => onCheckInSoldier(soldier.id, soldier.unitId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono">Accounted</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
