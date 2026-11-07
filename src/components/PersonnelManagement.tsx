import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowRightLeft,
  Award,
  Shield,
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Personnel, Unit, MilitaryRank, PersonnelStatus, SecurityClearance } from '../types/commander';

interface PersonnelManagementProps {
  personnel: Personnel[];
  units: Unit[];
  canEdit: boolean;
  onAddPersonnel: (soldier: Omit<Personnel, 'id'>) => void;
  onUpdatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  onTransferPersonnel: (soldierId: string, newUnitId: string, remarks: string) => void;
}

export const PersonnelManagement: React.FC<PersonnelManagementProps> = ({
  personnel,
  units,
  canEdit,
  onAddPersonnel,
  onUpdatePersonnel,
  onTransferPersonnel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSoldier, setSelectedSoldier] = useState<Personnel | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Transfer form state
  const [targetUnitId, setTargetUnitId] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Register soldier form state
  const [newRank, setNewRank] = useState<MilitaryRank>('PFC');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newServiceNumber, setNewServiceNumber] = useState('');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newDutyPosition, setNewDutyPosition] = useState('Rifleman');
  const [newMos, setNewMos] = useState('11B Infantryman');
  const [newClearance, setNewClearance] = useState<SecurityClearance>('SECRET');
  const [newBloodType, setNewBloodType] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [newPhone, setNewPhone] = useState('+1 (555) 000-0000');
  const [newEmail, setNewEmail] = useState('');

  // Filtering
  const filteredPersonnel = personnel.filter((p) => {
    const matchesSearch =
      `${p.rank} ${p.firstName} ${p.lastName} ${p.serviceNumber} ${p.dutyPosition} ${p.mos}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'ALL' || p.unitId === unitFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesUnit && matchesStatus;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLastName || !newServiceNumber) return;

    onAddPersonnel({
      serviceNumber: newServiceNumber,
      rank: newRank,
      firstName: newFirstName,
      lastName: newLastName,
      unitId: newUnitId,
      dutyPosition: newDutyPosition,
      mos: newMos,
      status: 'AVAILABLE',
      bloodType: newBloodType,
      dateOfEnlistment: new Date().toISOString().split('T')[0],
      clearance: newClearance,
      phone: newPhone,
      email: newEmail || `${newLastName.toLowerCase()}@command.mil`,
      emergencyContact: {
        name: 'Family Representative',
        relationship: 'Primary Contact',
        phone: newPhone,
      },
      apftScore: 500,
      lastPftDate: new Date().toISOString().split('T')[0],
      weaponsQual: 'MARKSMAN',
      qualifications: ['Basic Combat Training'],
      awards: ['National Defense Service Medal'],
      notes: 'Initial assignment record created.',
    });

    setIsRegisterOpen(false);
    // Reset form
    setNewFirstName('');
    setNewLastName('');
    setNewServiceNumber('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoldier || !targetUnitId) return;
    onTransferPersonnel(selectedSoldier.id, targetUnitId, transferRemarks);
    setIsTransferOpen(false);
    // Refresh selected soldier's unit
    setSelectedSoldier((prev) => (prev ? { ...prev, unitId: targetUnitId } : null));
  };

  const getUnitName = (uId: string) => {
    return units.find((u) => u.id === uId)?.shortName || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, rank, service #, MOS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Assigned Units</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.shortName} - {u.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Duty Statuses</option>
              <option value="AVAILABLE">Available (Fit)</option>
              <option value="LEAVE">On Leave</option>
              <option value="TRAINING">Training / TDY</option>
              <option value="UNAVAILABLE">Medical / Quarters</option>
              <option value="PENDING_REVIEW">Action Required</option>
            </select>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Personnel</span>
          </button>
        )}
      </div>

      {/* Main Personnel Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-slate-100 text-sm">
              MILITARY PERSONNEL ROSTER ({filteredPersonnel.length} RECORDS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorized military records, rank assignments, and service readiness accountability.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service ID & Name</th>
                <th className="py-3 px-4">Rank / Position</th>
                <th className="py-3 px-4">Assigned Unit</th>
                <th className="py-3 px-4">MOS / Specialty</th>
                <th className="py-3 px-4">Clearance</th>
                <th className="py-3 px-4">ACFT / Qual</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Service Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPersonnel.map((soldier) => (
                <tr
                  key={soldier.id}
                  onClick={() => setSelectedSoldier(soldier)}
                  className="hover:bg-slate-800/60 cursor-pointer transition"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="text-emerald-400 font-mono">{soldier.rank}</span>
                      <span>
                        {soldier.lastName}, {soldier.firstName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{soldier.serviceNumber}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{soldier.dutyPosition}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Bld: {soldier.bloodType}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {getUnitName(soldier.unitId)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-300 font-mono">{soldier.mos}</td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        soldier.clearance === 'TOP_SECRET'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : soldier.clearance === 'SECRET'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {soldier.clearance}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-200">
                      ACFT: <span className="text-emerald-400 font-bold">{soldier.apftScore}</span>/600
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{soldier.weaponsQual}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        soldier.status === 'AVAILABLE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : soldier.status === 'LEAVE'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : soldier.status === 'TRAINING'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : soldier.status === 'UNAVAILABLE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {soldier.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button className="text-slate-400 hover:text-emerald-400 transition p-1">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soldier Detail Drawer / Modal (201 Service Record Sheet) */}
      {selectedSoldier && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSoldier(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Military Header Card */}
            <div className="border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <Shield className="w-4 h-4" />
                <span>OFFICIAL MILITARY SERVICE RECORD (FORM DA-201 EQUIVALENT)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-heading font-bold text-slate-100">
                    {selectedSoldier.rank} {selectedSoldier.lastName}, {selectedSoldier.firstName}
                  </h2>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    Service #: <strong className="text-slate-200">{selectedSoldier.serviceNumber}</strong> | Callsign:{' '}
                    <strong className="text-slate-200">{selectedSoldier.callsign || 'N/A'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setTargetUnitId(selectedSoldier.unitId);
                        setIsTransferOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                      <span>Transfer Order</span>
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Print Bio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Service Record Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Col 1: Administrative Identifiers */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 font-mono uppercase text-[10px] font-bold">Duty Assignment</div>
                <div>
                  <span className="text-slate-400">Position:</span>{' '}
                  <span className="font-semibold text-slate-200">{selectedSoldier.dutyPosition}</span>
                </div>
                <div>
                  <span className="text-slate-400">Assigned Unit:</span>{' '}
                  <span className="font-semibold text-emerald-400">{getUnitName(selectedSoldier.unitId)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Primary MOS:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.mos}</span>
                </div>
                <div>
                  <span className="text-slate-400">Security Clearance:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.clearance}</span>
                </div>
                <div>
                  <span className="text-slate-400">Enlistment Date:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.dateOfEnlistment}</span>
                </div>
              </div>

              {/* Col 2: Readiness & Physical Standards */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 font-mono uppercase text-[10px] font-bold">Readiness Profile</div>
                <div>
                  <span className="text-slate-400">Duty Status:</span>{' '}
                  <span className="font-semibold text-emerald-300">{selectedSoldier.status}</span>
                </div>
                <div>
                  <span className="text-slate-400">Blood Type:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.bloodType}</span>
                </div>
                <div>
                  <span className="text-slate-400">ACFT Score:</span>{' '}
                  <span className="font-mono text-emerald-400 font-bold">{selectedSoldier.apftScore}</span> / 600
                </div>
                <div>
                  <span className="text-slate-400">Last Fitness Test:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.lastPftDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Marksmanship:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.weaponsQual}</span>
                </div>
              </div>

              {/* Col 3: Emergency & Contact */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 font-mono uppercase text-[10px] font-bold">Contact & NOK</div>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">MilNet Email:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedSoldier.email}</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <div className="text-[10px] text-slate-400 font-mono">Next of Kin:</div>
                  <div className="font-semibold text-slate-200">{selectedSoldier.emergencyContact.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedSoldier.emergencyContact.relationship} • {selectedSoldier.emergencyContact.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Badges & Qualifications */}
            <div className="mt-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono uppercase text-[10px] font-bold mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Authorized Military Qualifications & Skill Badges</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSoldier.qualifications.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]"
                  >
                    ✦ {q}
                  </span>
                ))}
              </div>
            </div>

            {/* Awards & Commendations */}
            <div className="mt-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono uppercase text-[10px] font-bold mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Decorations, Medals & Citations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSoldier.awards.map((aw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-mono text-[11px]"
                  >
                    ★ {aw}
                  </span>
                ))}
              </div>
            </div>

            {/* Commander Administrative Notes */}
            <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 font-mono uppercase text-[10px] font-bold mb-1">
                Commander / S-1 Administrative Remarks
              </div>
              <p className="text-xs text-slate-300 italic">{selectedSoldier.notes || 'No remarks recorded.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Order Modal */}
      {isTransferOpen && selectedSoldier && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              ISSUE MILITARY REASSIGNMENT / TRANSFER ORDER
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Reassign {selectedSoldier.rank} {selectedSoldier.lastName} ({selectedSoldier.serviceNumber})
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Target Echelon / Unit</label>
                <select
                  value={targetUnitId}
                  onChange={(e) => setTargetUnitId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:border-emerald-500"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Transfer Authority / Reason</label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="e.g. In accordance with Battalion Manning Directives FY26-Q4..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Personnel Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-heading font-bold text-slate-100 text-base">
                REGISTER MILITARY PERSONNEL RECORD
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Military Rank</label>
                  <select
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value as MilitaryRank)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="PV2">PV2 - Private</option>
                    <option value="PFC">PFC - Private 1st Class</option>
                    <option value="SPC">SPC - Specialist</option>
                    <option value="CPL">CPL - Corporal</option>
                    <option value="SGT">SGT - Sergeant</option>
                    <option value="SSG">SSG - Staff Sergeant</option>
                    <option value="SFC">SFC - Sergeant 1st Class</option>
                    <option value="MSG">MSG - Master Sergeant</option>
                    <option value="1SG">1SG - First Sergeant</option>
                    <option value="WO1">WO1 - Warrant Officer 1</option>
                    <option value="2LT">2LT - 2nd Lieutenant</option>
                    <option value="1LT">1LT - 1st Lieutenant</option>
                    <option value="CPT">CPT - Captain</option>
                    <option value="MAJ">MAJ - Major</option>
                    <option value="LTC">LTC - Lieutenant Colonel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Service Number (ID)</label>
                  <input
                    type="text"
                    required
                    value={newServiceNumber}
                    onChange={(e) => setNewServiceNumber(e.target.value)}
                    placeholder="e.g. RA-559102"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Assigned Unit</label>
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
                  <label className="block text-slate-300 font-mono mb-1">Duty Position</label>
                  <input
                    type="text"
                    required
                    value={newDutyPosition}
                    onChange={(e) => setNewDutyPosition(e.target.value)}
                    placeholder="e.g. Squad Leader"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">MOS / Specialty</label>
                  <input
                    type="text"
                    required
                    value={newMos}
                    onChange={(e) => setNewMos(e.target.value)}
                    placeholder="e.g. 11B Infantryman"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Security Clearance</label>
                  <select
                    value={newClearance}
                    onChange={(e) => setNewClearance(e.target.value as SecurityClearance)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="CONFIDENTIAL">Confidential</option>
                    <option value="SECRET">Secret</option>
                    <option value="TOP_SECRET">Top Secret</option>
                    <option value="NONE">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Blood Type</label>
                  <select
                    value={newBloodType}
                    onChange={(e) => setNewBloodType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold cursor-pointer"
                >
                  Register into Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
