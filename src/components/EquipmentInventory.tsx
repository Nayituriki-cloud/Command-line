import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  User,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { EquipmentItem, Personnel, Unit } from '../types/commander';

interface EquipmentInventoryProps {
  equipment: EquipmentItem[];
  personnel: Personnel[];
  units: Unit[];
  canManage: boolean;
  onAddEquipment: (item: Omit<EquipmentItem, 'id'>) => void;
  onUpdateCondition: (itemId: string, condition: EquipmentItem['condition']) => void;
  onReassignEquipment: (itemId: string, soldierId?: string) => void;
}

export const EquipmentInventory: React.FC<EquipmentInventoryProps> = ({
  equipment,
  personnel,
  units,
  canManage,
  onAddEquipment,
  onUpdateCondition,
  onReassignEquipment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<EquipmentItem | null>(null);
  const [selectedSoldierId, setSelectedSoldierId] = useState('');

  // Add equipment form state
  const [newSerial, setNewSerial] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<EquipmentItem['category']>('COMMUNICATION');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newLocation, setNewLocation] = useState('Central Arms Vault');
  const [newNotes, setNewNotes] = useState('Factory sealed, calibrated.');

  const filteredItems = equipment.filter((eq) => {
    const matchesSearch = `${eq.name} ${eq.serialNumber} ${eq.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || eq.category === categoryFilter;
    const matchesCondition = conditionFilter === 'ALL' || eq.condition === conditionFilter;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial || !newName) return;

    onAddEquipment({
      serialNumber: newSerial,
      name: newName,
      category: newCategory,
      unitId: newUnitId,
      condition: 'SERVICEABLE',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      nextInspectionDue: '2026-12-31',
      location: newLocation,
      notes: newNotes,
    });

    setIsAddOpen(false);
    setNewSerial('');
    setNewName('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignItem) return;
    onReassignEquipment(assignItem.id, selectedSoldierId || undefined);
    setAssignItem(null);
  };

  const getPersonnelName = (id?: string) => {
    if (!id) return 'Unassigned (Supply Cage)';
    const p = personnel.find((pers) => pers.id === id);
    return p ? `${p.rank} ${p.lastName}, ${p.firstName}` : 'Unassigned';
  };

  const getUnitName = (id: string) => {
    return units.find((u) => u.id === id)?.shortName || 'Unit';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            EQUIPMENT, LOGISTICS & PROPERTY BOOK ACCOUNTABILITY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hand receipts, serial number tracking, vehicle maintenance logs, and communication equipment custody.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial #, item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="COMMUNICATION">Communications</option>
            <option value="VEHICLE">Vehicles & Transport</option>
            <option value="SAFETY_OPTICS">Optics & NVGs</option>
            <option value="OFFICE_IT">Office & IT Hardware</option>
            <option value="UNIFORM_KIT">Kits & Aid Packs</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-emerald-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="SERVICEABLE">Serviceable (100% FMC)</option>
            <option value="REQUIRES_MAINTENANCE">Requires Maintenance</option>
            <option value="IN_REPAIR">In Depot Repair</option>
            <option value="CRITICAL_DEADLINE">Critical Deadline (NMC)</option>
          </select>

          {canManage && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Equipment Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-slate-100 text-sm">
            PROPERTY BOOK & INVENTORY LEDGER ({filteredItems.length} ITEMS)
          </h3>
          <span className="text-xs text-slate-400 font-mono">100% Hand Receipt Reconciled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Item Nomenclature</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Assigned Custodian</th>
                <th className="py-3 px-4">Next Inspection</th>
                <th className="py-3 px-4 text-right">Custodian / Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{item.serialNumber}</td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{item.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.location}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.condition === 'SERVICEABLE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.condition === 'REQUIRES_MAINTENANCE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.condition.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-200">{getPersonnelName(item.assignedToPersonnelId)}</div>
                    <div className="text-[10px] text-slate-400">{getUnitName(item.unitId)}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400">{item.nextInspectionDue}</td>

                  <td className="py-3 px-4 text-right">
                    {canManage && (
                      <button
                        onClick={() => {
                          setAssignItem(item);
                          setSelectedSoldierId(item.assignedToPersonnelId || '');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs transition cursor-pointer"
                      >
                        Hand Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hand Receipt Reassignment Modal */}
      {assignItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              ISSUE / TRANSFER HAND RECEIPT (FORM DA-2062 EQUIVALENT)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Item: <strong className="text-slate-200">{assignItem.name}</strong> ({assignItem.serialNumber})
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Assigned Custodian (Soldier)</label>
                <select
                  value={selectedSoldierId}
                  onChange={(e) => setSelectedSoldierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  <option value="">Return to Supply Room (Unassigned)</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName} - {p.dutyPosition}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Serviceability / Inspection Status</label>
                <select
                  value={assignItem.condition}
                  onChange={(e) => onUpdateCondition(assignItem.id, e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  <option value="SERVICEABLE">Serviceable (Fully Mission Capable)</option>
                  <option value="REQUIRES_MAINTENANCE">Requires Maintenance</option>
                  <option value="IN_REPAIR">In Depot Repair</option>
                  <option value="CRITICAL_DEADLINE">Critical Deadline</option>
                </select>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Authorized hand receipt requires electronic signing and countersignature by Unit Supply Sergeant.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Certify Hand Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              RECORD MILITARY PROPERTY BOOK ITEM
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter non-tactical property, comms equipment, vehicle, or safety hardware.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Item Nomenclature / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toughbook CF-33 Tactical Computer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT-CF33-9921"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="COMMUNICATION">Communication</option>
                    <option value="VEHICLE">Vehicle & Transport</option>
                    <option value="OFFICE_IT">Office & IT Hardware</option>
                    <option value="UNIFORM_KIT">Uniform & Aid Kit</option>
                    <option value="SAFETY_OPTICS">Safety & Optics</option>
                  </select>
                </div>
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
                <label className="block text-slate-300 font-mono mb-1">Storage Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Register into Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
