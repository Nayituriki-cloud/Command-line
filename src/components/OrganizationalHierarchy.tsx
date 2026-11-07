import React, { useState } from 'react';
import {
  Network,
  Building,
  Plus,
  Shield,
  Users,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Award,
  Layers,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Unit, Personnel, EchelonLevel, MilitaryRank } from '../types/commander';

interface OrganizationalHierarchyProps {
  units: Unit[];
  personnel: Personnel[];
  canEdit: boolean;
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  onUpdateUnitCommander: (unitId: string, commanderId: string) => void;
}

export const OrganizationalHierarchy: React.FC<OrganizationalHierarchyProps> = ({
  units,
  personnel,
  canEdit,
  onAddUnit,
  onUpdateUnitCommander,
}) => {
  const [expandedUnitIds, setExpandedUnitIds] = useState<Record<string, boolean>>({
    'unit-gen': true,
    'unit-bde-1': true,
    'unit-bn-2': true,
    'unit-co-alpha': true,
    'unit-plt-1': true,
  });

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0] || null);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isChangeCommanderOpen, setIsChangeCommanderOpen] = useState(false);

  // New unit form state
  const [newUnitName, setNewUnitName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newEchelon, setNewEchelon] = useState<EchelonLevel>('SECTION');
  const [newParentId, setNewParentId] = useState<string>(units[0]?.id || '');
  const [newLocation, setNewLocation] = useState('Compound Alpha');
  const [newAuthStrength, setNewAuthStrength] = useState(10);

  // Change commander form state
  const [selectedNewCommanderId, setSelectedNewCommanderId] = useState('');

  const toggleExpand = (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedUnitIds((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newShortName) return;

    onAddUnit({
      name: newUnitName,
      shortName: newShortName,
      echelon: newEchelon,
      parentId: newParentId,
      commanderId: 'pers-4',
      commanderRank: 'CPT',
      commanderName: 'Designated Leader',
      location: newLocation,
      authorizedStrength: Number(newAuthStrength),
      assignedStrength: 0,
      readinessRate: 100,
    });

    setIsAddUnitOpen(false);
    setNewUnitName('');
    setNewShortName('');
  };

  const handleChangeCommanderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !selectedNewCommanderId) return;
    onUpdateUnitCommander(selectedUnit.id, selectedNewCommanderId);
    setIsChangeCommanderOpen(false);
  };

  // Find root units (parentId === null)
  const rootUnits = units.filter((u) => u.parentId === null);

  // Render recursive echelon node
  const renderUnitNode = (unit: Unit, depth: number = 0) => {
    const children = units.filter((u) => u.parentId === unit.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedUnitIds[unit.id];
    const isSelected = selectedUnit?.id === unit.id;
    const assignedSoldiers = personnel.filter((p) => p.unitId === unit.id);

    return (
      <div key={unit.id} className="select-none">
        <div
          onClick={() => setSelectedUnit(unit)}
          style={{ marginLeft: `${depth * 20}px` }}
          className={`my-1.5 p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition ${
            isSelected
              ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/40 text-emerald-100'
              : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(unit.id, e)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs">{unit.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-950 border border-slate-700 text-slate-400 rounded">
                  {unit.echelon}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Commander: <strong className="text-slate-300">{unit.commanderRank} {unit.commanderName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {assignedSoldiers.length} / {unit.authorizedStrength}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">{unit.readinessRate}% Ready</div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-800/80 ml-4 pl-1">
            {children.map((child) => renderUnitNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Soldiers in the selected unit
  const selectedUnitSoldiers = selectedUnit ? personnel.filter((p) => p.unitId === selectedUnit.id) : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-400" />
            MILITARY ORGANIZATIONAL STRUCTURE & COMMAND CHAIN
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hierarchical command tree from General Command down to Section and Individual Soldiers.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setIsAddUnitOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subordinate Unit</span>
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Tree + Unit Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Echelon Hierarchy Tree */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs font-mono text-slate-400 uppercase font-bold mb-3 flex items-center justify-between">
            <span>Command Echelon Tree</span>
            <span className="text-[11px] text-slate-500">Click unit to inspect personnel</span>
          </div>

          <div className="space-y-1">
            {rootUnits.map((root) => renderUnitNode(root, 0))}
          </div>
        </div>

        {/* Right Column: Selected Unit Dossier */}
        <div className="lg:col-span-5 space-y-4">
          {selectedUnit ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded uppercase font-bold">
                    {selectedUnit.echelon} LEVEL
                  </span>
                  <h3 className="font-heading font-bold text-slate-100 text-lg mt-1">
                    {selectedUnit.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedUnit.location}</span>
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() => {
                      setSelectedNewCommanderId(selectedUnit.commanderId);
                      setIsChangeCommanderOpen(true);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                  >
                    Change CDR
                  </button>
                )}
              </div>

              {/* Commander Card */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-500 flex items-center justify-center font-heading font-bold text-emerald-300 text-sm">
                  {selectedUnit.commanderRank}
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Commanding Officer</div>
                  <div className="font-semibold text-slate-200 text-xs">
                    {selectedUnit.commanderRank} {selectedUnit.commanderName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Direct Administrative Responsibility
                  </div>
                </div>
              </div>

              {/* Strength & Readiness Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Manning Strength</div>
                  <div className="text-xl font-bold font-heading text-slate-200 mt-1">
                    {selectedUnitSoldiers.length}{' '}
                    <span className="text-xs text-slate-500 font-normal">/ {selectedUnit.authorizedStrength}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {Math.round((selectedUnitSoldiers.length / (selectedUnit.authorizedStrength || 1)) * 100)}% of authorized
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Readiness Rate</div>
                  <div className="text-xl font-bold font-heading text-emerald-400 mt-1">
                    {selectedUnit.readinessRate}%
                  </div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Combat Fit Status</div>
                </div>
              </div>

              {/* Personnel Assigned to this Echelon */}
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase font-bold mb-2 flex items-center justify-between">
                  <span>Assigned Personnel ({selectedUnitSoldiers.length})</span>
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                </div>

                {selectedUnitSoldiers.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs bg-slate-950 rounded-lg border border-slate-800">
                    No individual soldiers directly assigned to this echelon node. Subordinate units hold personnel.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {selectedUnitSoldiers.map((soldier) => (
                      <div
                        key={soldier.id}
                        className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">
                            <span className="text-emerald-400 font-mono mr-1.5">{soldier.rank}</span>
                            {soldier.lastName}, {soldier.firstName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{soldier.dutyPosition}</div>
                        </div>

                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                            soldier.status === 'AVAILABLE'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {soldier.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select a unit from the hierarchy to view echelon details and personnel assignments.
            </div>
          )}
        </div>
      </div>

      {/* Add Subordinate Unit Modal */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              ESTABLISH SUBORDINATE UNIT
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new military unit or echelon to the command hierarchy.
            </p>

            <form onSubmit={handleAddUnitSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Unit Full Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3rd Platoon 'Valkyries'"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Short Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-PLT"
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Echelon Level</label>
                  <select
                    value={newEchelon}
                    onChange={(e) => setNewEchelon(e.target.value as EchelonLevel)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                  >
                    <option value="SECTION">Section</option>
                    <option value="PLATOON">Platoon</option>
                    <option value="COMPANY">Company</option>
                    <option value="BATTALION">Battalion</option>
                    <option value="BRIGADE">Brigade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Parent Command Echelon</label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.shortName} - {u.name} ({u.echelon})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Authorized Strength</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newAuthStrength}
                    onChange={(e) => setNewAuthStrength(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Station / Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Establish Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Commander Modal */}
      {isChangeCommanderOpen && selectedUnit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              APPOINT COMMANDING OFFICER
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an authorized military leader for {selectedUnit.name}
            </p>

            <form onSubmit={handleChangeCommanderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Select Commander / Leader</label>
                <select
                  value={selectedNewCommanderId}
                  onChange={(e) => setSelectedNewCommanderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName} - {p.dutyPosition}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChangeCommanderOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
