import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  X,
} from 'lucide-react';
import { WelfareRequest, Personnel } from '../types/commander';

interface PersonnelWelfareProps {
  welfareRequests: WelfareRequest[];
  personnel: Personnel[];
  canApprove: boolean;
  onApproveRequest: (requestId: string, remarks?: string) => void;
  onRejectRequest: (requestId: string, remarks?: string) => void;
  onSubmitRequest: (request: Omit<WelfareRequest, 'id'>) => void;
}

export const PersonnelWelfare: React.FC<PersonnelWelfareProps> = ({
  welfareRequests,
  personnel,
  canApprove,
  onApproveRequest,
  onRejectRequest,
  onSubmitRequest,
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedSoldierId, setSelectedSoldierId] = useState(personnel[0]?.id || '');
  const [requestType, setRequestType] = useState<WelfareRequest['type']>('EMERGENCY_LEAVE');
  const [startDate, setStartDate] = useState('2026-11-12');
  const [endDate, setEndDate] = useState('2026-11-19');
  const [reason, setReason] = useState('');

  // Commander review modal state
  const [decisionModal, setDecisionModal] = useState<{
    request: WelfareRequest;
    decision: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [reviewerRemarks, setReviewerRemarks] = useState('');

  const filteredRequests = welfareRequests.filter((r) => {
    return filterType === 'ALL' || r.type === filterType;
  });

  const getPersonnel = (id: string) => personnel.find((p) => p.id === id);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    onSubmitRequest({
      personnelId: selectedSoldierId,
      type: requestType,
      submissionDate: new Date().toISOString().split('T')[0],
      startDate,
      endDate,
      reason,
      status: 'PENDING',
    });

    setIsSubmitOpen(false);
    setReason('');
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModal) return;

    if (decisionModal.decision === 'APPROVE') {
      onApproveRequest(decisionModal.request.id, reviewerRemarks);
    } else {
      onRejectRequest(decisionModal.request.id, reviewerRemarks);
    }

    setDecisionModal(null);
    setReviewerRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            PERSONNEL WELFARE, FAMILY SUPPORT & CONVALESCENCE
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emergency leave, medical convalescence profiles, quarters accommodation, and transition assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-emerald-500"
          >
            <option value="ALL">All Welfare Categories</option>
            <option value="CONVALESCENT_LEAVE">Convalescent / Medical Leave</option>
            <option value="EMERGENCY_LEAVE">Emergency Leave (Red Cross)</option>
            <option value="FAMILY_SUPPORT">Family Support Assistance</option>
            <option value="ACCOMMODATION">Barracks Accommodation</option>
            <option value="TRANSITION_ASSISTANCE">Service Transition / Retirement</option>
          </select>

          <button
            onClick={() => setIsSubmitOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Request</span>
          </button>
        </div>
      </div>

      {/* Welfare Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-slate-100 text-sm">
            WELFARE & LEAVE ADJUDICATION QUEUE ({filteredRequests.length} ACTIONS)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Confidential Command Welfare Channel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Soldier</th>
                <th className="py-3 px-4">Welfare Category</th>
                <th className="py-3 px-4">Dates / Duration</th>
                <th className="py-3 px-4">Detailed Justification</th>
                <th className="py-3 px-4">Decision Status</th>
                <th className="py-3 px-4">Commander Remarks</th>
                <th className="py-3 px-4 text-right">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRequests.map((req) => {
                const soldier = getPersonnel(req.personnelId);
                return (
                  <tr key={req.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      {soldier ? (
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1">
                            <span className="text-emerald-400 font-mono">{soldier.rank}</span>
                            <span>{soldier.lastName}, {soldier.firstName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{soldier.serviceNumber}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unknown</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {req.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {req.startDate ? `${req.startDate} to ${req.endDate}` : 'Ongoing / Station'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                      <p className="line-clamp-2 text-[11px]">{req.reason}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] italic">
                      {req.reviewerNotes || 'Awaiting command review.'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'PENDING' && canApprove ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDecisionModal({ request: req, decision: 'APPROVE' })}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setDecisionModal({ request: req, decision: 'REJECT' })}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition cursor-pointer"
                          >
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Remarks Modal */}
      {decisionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              COMMAND DECISION RECORD
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Action: <strong className={decisionModal.decision === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}>
                {decisionModal.decision}
              </strong>{' '}
              request for {decisionModal.request.type.replace(/_/g, ' ')}
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Commander Endorsement / Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={reviewerRemarks}
                  onChange={(e) => setReviewerRemarks(e.target.value)}
                  placeholder="Record official commander justification, safety stipulations, or return-to-duty instructions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDecisionModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white font-semibold ${
                    decisionModal.decision === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Finalize {decisionModal.decision}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Welfare Request Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-heading font-bold text-slate-100 text-base">
                SUBMIT WELFARE / LEAVE APPLICATION
              </h3>
              <button
                onClick={() => setIsSubmitOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Requesting Soldier</label>
                <select
                  value={selectedSoldierId}
                  onChange={(e) => setSelectedSoldierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName} - {p.serviceNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  <option value="EMERGENCY_LEAVE">Emergency Leave (Red Cross verified)</option>
                  <option value="CONVALESCENT_LEAVE">Convalescent / Medical Quarters</option>
                  <option value="FAMILY_SUPPORT">Family Support Assistance</option>
                  <option value="ACCOMMODATION">Barracks Accommodation Reassignment</option>
                  <option value="TRANSITION_ASSISTANCE">Service Transition / Retirement Planning</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Detailed Reason & Contact During Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State detailed reason, emergency contact location and phone number..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Submit for Commander Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
