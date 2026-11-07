import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Shield,
  Calendar,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Personnel, Unit, DutyAssignment, AttendanceRecord, EquipmentItem } from '../types/commander';
import { exportToCsv } from '../utils/exportUtils';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel[];
  units: Unit[];
  dutyAssignments: DutyAssignment[];
  attendanceRecords: AttendanceRecord[];
  equipment: EquipmentItem[];
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  personnel,
  units,
  dutyAssignments,
  attendanceRecords,
  equipment,
}) => {
  const [reportType, setReportType] = useState<'PERSTAT_DAILY' | 'ATTENDANCE' | 'LEAVE' | 'EQUIPMENT'>('PERSTAT_DAILY');
  const [selectedUnitId, setSelectedUnitId] = useState('ALL');

  if (!isOpen) return null;

  const filteredPersonnel = personnel.filter((p) => {
    return selectedUnitId === 'ALL' || p.unitId === selectedUnitId;
  });

  const totalPersonnel = filteredPersonnel.length;
  const availableCount = filteredPersonnel.filter((p) => p.status === 'AVAILABLE').length;
  const leaveCount = filteredPersonnel.filter((p) => p.status === 'LEAVE').length;
  const trainingCount = filteredPersonnel.filter((p) => p.status === 'TRAINING').length;
  const unavailableCount = filteredPersonnel.filter((p) => p.status === 'UNAVAILABLE').length;
  const attentionCount = filteredPersonnel.filter((p) => p.status === 'PENDING_REVIEW').length;
  const readinessPct = totalPersonnel > 0 ? Math.round((availableCount / totalPersonnel) * 100) : 100;

  const todayStr = '2026-11-07';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (reportType === 'PERSTAT_DAILY') {
      const headers = ['Service_ID', 'Rank', 'Last_Name', 'First_Name', 'Position', 'MOS', 'Clearance', 'Status'];
      const rows = filteredPersonnel.map((p) => [
        p.serviceNumber,
        p.rank,
        p.lastName,
        p.firstName,
        p.dutyPosition,
        p.mos,
        p.clearance,
        p.status,
      ]);
      exportToCsv(`COMMANDER360_DAILY_PERSTAT_${todayStr}`, headers, rows);
    } else if (reportType === 'ATTENDANCE') {
      const headers = ['Service_ID', 'Rank', 'Last_Name', 'First_Name', 'CheckIn', 'Status'];
      const rows = filteredPersonnel.map((p) => {
        const rec = attendanceRecords.find((r) => r.personnelId === p.id);
        return [p.serviceNumber, p.rank, p.lastName, p.firstName, rec?.checkInTime || '06:30', rec?.status || p.status];
      });
      exportToCsv(`COMMANDER360_ATTENDANCE_REPORT_${todayStr}`, headers, rows);
    } else if (reportType === 'EQUIPMENT') {
      const headers = ['Serial_Number', 'Nomenclature', 'Category', 'Condition', 'Location'];
      const rows = equipment.map((eq) => [eq.serialNumber, eq.name, eq.category, eq.condition, eq.location]);
      exportToCsv(`COMMANDER360_PROPERTY_BOOK_REPORT`, headers, rows);
    } else {
      const headers = ['Service_ID', 'Rank', 'Last_Name', 'First_Name', 'Status', 'Notes'];
      const rows = filteredPersonnel
        .filter((p) => p.status === 'LEAVE')
        .map((p) => [p.serviceNumber, p.rank, p.lastName, p.firstName, p.status, p.notes || '']);
      exportToCsv(`COMMANDER360_LEAVE_ROSTER`, headers, rows);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-6 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto">
        {/* Controls - Hidden during print */}
        <div className="no-print border-b border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>OFFICIAL COMMAND REPORT ENGINE</span>
            </div>
            <h2 className="text-lg font-heading font-bold text-slate-100">
              Generate Formatted Military Reports & Dispatches
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500"
            >
              <option value="PERSTAT_DAILY">Daily Personnel Status (PERSTAT)</option>
              <option value="ATTENDANCE">Morning Muster Attendance Report</option>
              <option value="LEAVE">Approved Leave & Convalescence Roster</option>
              <option value="EQUIPMENT">Property Book & Equipment Accountability</option>
            </select>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted Official Military Document Layout (Printable) */}
        <div className="bg-white text-slate-950 p-6 md:p-8 rounded-lg shadow font-mono text-xs border border-slate-300">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-950 pb-4 mb-6">
            <div className="text-[11px] tracking-widest font-bold uppercase text-slate-700">
              DEPARTMENT OF THE ARMY • HEADQUARTERS
            </div>
            <div className="text-base font-bold uppercase tracking-wider text-slate-950 mt-1">
              COMMANDER 360 MILITARY PERSONNEL REPORT
            </div>
            <div className="text-[10px] text-slate-600 mt-1">
              SECURITY CLASSIFICATION: UNCLASSIFIED // FOR OFFICIAL USE ONLY (FOUO)
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-700 mt-3 pt-2 border-t border-slate-300">
              <span>REPORT DATE: {todayStr} • 0700 HOURS LOCAL</span>
              <span>ECHELON: 2ND INFANTRY BATTALION & SUBORDINATE UNITS</span>
              <span>AUTHENTICATION CODE: CDR-360-AUTH-992</span>
            </div>
          </div>

          {/* PERSTAT Numerical Summary Table */}
          <div className="mb-6">
            <div className="font-bold text-slate-900 uppercase text-xs border-b border-slate-900 pb-1 mb-2">
              SECTION I: PERSONNEL STRENGTH STATUS (PERSTAT ACCOUNTABILITY)
            </div>

            <div className="grid grid-cols-6 gap-2 text-center border border-slate-900 p-2 text-[11px] mb-3">
              <div className="border-r border-slate-400 pr-1">
                <div className="text-slate-600 text-[10px]">TOTAL ASSIGNED</div>
                <div className="text-base font-bold text-slate-900">{totalPersonnel}</div>
              </div>
              <div className="border-r border-slate-400 pr-1">
                <div className="text-slate-600 text-[10px]">PRESENT (P)</div>
                <div className="text-base font-bold text-slate-900">{availableCount}</div>
              </div>
              <div className="border-r border-slate-400 pr-1">
                <div className="text-slate-600 text-[10px]">LEAVE (L)</div>
                <div className="text-base font-bold text-slate-900">{leaveCount}</div>
              </div>
              <div className="border-r border-slate-400 pr-1">
                <div className="text-slate-600 text-[10px]">TRAINING (T)</div>
                <div className="text-base font-bold text-slate-900">{trainingCount}</div>
              </div>
              <div className="border-r border-slate-400 pr-1">
                <div className="text-slate-600 text-[10px]">MEDICAL (M)</div>
                <div className="text-base font-bold text-slate-900">{unavailableCount}</div>
              </div>
              <div>
                <div className="text-slate-600 text-[10px]">FITNESS %</div>
                <div className="text-base font-bold text-slate-900">{readinessPct}%</div>
              </div>
            </div>
          </div>

          {/* Section II: Nominal Roll */}
          <div className="mb-6">
            <div className="font-bold text-slate-900 uppercase text-xs border-b border-slate-900 pb-1 mb-2">
              SECTION II: NOMINAL PERSONNEL ROSTER & DUTY POSITIONS
            </div>

            <table className="w-full text-[10px] text-left border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400">
                  <th className="p-1.5 border-r border-slate-400">SERVICE ID</th>
                  <th className="p-1.5 border-r border-slate-400">GRADE</th>
                  <th className="p-1.5 border-r border-slate-400">LAST NAME, FIRST</th>
                  <th className="p-1.5 border-r border-slate-400">DUTY TITLE</th>
                  <th className="p-1.5 border-r border-slate-400">MOS</th>
                  <th className="p-1.5 border-r border-slate-400">ACFT</th>
                  <th className="p-1.5">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.slice(0, 15).map((soldier) => (
                  <tr key={soldier.id} className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-400 font-bold">{soldier.serviceNumber}</td>
                    <td className="p-1.5 border-r border-slate-400">{soldier.rank}</td>
                    <td className="p-1.5 border-r border-slate-400">
                      {soldier.lastName}, {soldier.firstName}
                    </td>
                    <td className="p-1.5 border-r border-slate-400">{soldier.dutyPosition}</td>
                    <td className="p-1.5 border-r border-slate-400">{soldier.mos}</td>
                    <td className="p-1.5 border-r border-slate-400">{soldier.apftScore}</td>
                    <td className="p-1.5 font-bold">{soldier.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPersonnel.length > 15 && (
              <div className="text-[9px] text-slate-500 mt-1 italic">
                Showing first 15 of {filteredPersonnel.length} entries. Complete nominal roll attached in annex.
              </div>
            )}
          </div>

          {/* Commander Authentication Signature Block */}
          <div className="mt-8 pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-[11px]">
            <div>
              <div className="font-bold">PREPARED BY:</div>
              <div className="mt-6 border-b border-slate-600 pb-1 font-bold">
                SSG JACKSON, KEISHA - S-1 PERSONNEL NCOIC
              </div>
              <div className="text-slate-600 text-[10px] mt-0.5">Battalion Administrative Directorate</div>
            </div>

            <div>
              <div className="font-bold">CERTIFIED & AUTHENTICATED BY:</div>
              <div className="mt-6 border-b border-slate-600 pb-1 font-bold">
                LTC CASTILLO, HECTOR M. - COMMANDING
              </div>
              <div className="text-slate-600 text-[10px] mt-0.5">Headquarters, 2nd Infantry Battalion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
