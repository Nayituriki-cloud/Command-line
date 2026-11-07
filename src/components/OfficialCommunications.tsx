import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  AlertTriangle,
  FileText,
  Award,
  CheckCircle2,
  Calendar,
  X,
  Shield,
  Send,
} from 'lucide-react';
import { OfficialAnnouncement, PerformanceReview, Personnel, Unit } from '../types/commander';

interface OfficialCommunicationsProps {
  announcements: OfficialAnnouncement[];
  reviews: PerformanceReview[];
  personnel: Personnel[];
  units: Unit[];
  canPublish: boolean;
  onPublishAnnouncement: (announcement: Omit<OfficialAnnouncement, 'id'>) => void;
  onAddReview: (review: Omit<PerformanceReview, 'id'>) => void;
}

export const OfficialCommunications: React.FC<OfficialCommunicationsProps> = ({
  announcements,
  reviews,
  personnel,
  units,
  canPublish,
  onPublishAnnouncement,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<'announcements' | 'reviews'>('announcements');
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // New announcement form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<OfficialAnnouncement['priority']>('HIGH');
  const [newCategory, setNewCategory] = useState<OfficialAnnouncement['category']>('ADMINISTRATIVE');
  const [newTargetUnit, setNewTargetUnit] = useState('ALL');
  const [newContent, setNewContent] = useState('');
  const [authorName, setAuthorName] = useState('CPT Vance, Marcus');

  // New performance review form state
  const [reviewPersonnelId, setReviewPersonnelId] = useState(personnel[0]?.id || '');
  const [reviewPeriod, setReviewPeriod] = useState('FY26 Q4 Evaluation');
  const [reviewRating, setReviewRating] = useState<PerformanceReview['rating']>('EXCEEDS_STANDARDS');
  const [dutyPerformanceSummary, setDutyPerformanceSummary] = useState('');
  const [potentialAssessment, setPotentialAssessment] = useState('');

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    onPublishAnnouncement({
      title: newTitle,
      priority: newPriority,
      category: newCategory,
      publishedDate: new Date().toISOString().split('T')[0],
      authorRankName: authorName,
      authorRole: 'Commanding Officer',
      targetUnitId: newTargetUnit,
      content: newContent,
      isAcknowledged: false,
    });

    setIsPublishOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dutyPerformanceSummary) return;

    onAddReview({
      personnelId: reviewPersonnelId,
      reviewPeriod,
      rating: reviewRating,
      dutyPerformanceSummary,
      potentialAssessment,
      reviewerId: 'pers-4',
      reviewerName: 'CPT Marcus Vance',
      date: new Date().toISOString().split('T')[0],
    });

    setIsReviewOpen(false);
    setDutyPerformanceSummary('');
    setPotentialAssessment('');
  };

  const getPersonnelName = (id: string) => {
    const p = personnel.find((pers) => pers.id === id);
    return p ? `${p.rank} ${p.lastName}, ${p.firstName}` : 'Soldier';
  };

  return (
    <div className="space-y-6">
      {/* Header and Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-400" />
            OFFICIAL COMMUNICATIONS, DIRECTIVES & PERFORMANCE REVIEWS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Command orders, safety stand-downs, inspection notices, and non-commissioned officer evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-md font-heading transition cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Directives ({announcements.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-md font-heading transition cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              NCOER / OER Reviews ({reviews.length})
            </button>
          </div>

          {canPublish && (
            <button
              onClick={() => (activeTab === 'announcements' ? setIsPublishOpen(true) : setIsReviewOpen(true))}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'announcements' ? 'Publish Directive' : 'Record Review'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Announcements Stream */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      ann.priority === 'URGENT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : ann.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ann.priority}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {ann.category}
                  </span>

                  <span className="text-slate-400 font-mono text-xs">
                    Target: <strong className="text-slate-200">{ann.targetUnitId}</strong>
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Published: <span className="text-slate-200">{ann.publishedDate}</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-slate-100 text-base">{ann.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="text-slate-400 font-mono">
                  Issuing Authority: <strong className="text-emerald-400">{ann.authorRankName}</strong> ({ann.authorRole})
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Acknowledged by Unit Leaders
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluations & Commendations */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded uppercase font-bold">
                    {rev.rating.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-heading font-bold text-slate-100 text-base mt-1">
                    Rated Soldier: {getPersonnelName(rev.personnelId)}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    Period: <strong className="text-slate-200">{rev.reviewPeriod}</strong> • Date: {rev.date}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">Rater:</div>
                  <div className="font-semibold text-slate-200">{rev.reviewerName}</div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 font-mono uppercase text-[10px] font-bold mb-1">
                    Performance Evaluation Summary
                  </div>
                  <p className="text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                    &ldquo;{rev.dutyPerformanceSummary}&rdquo;
                  </p>
                </div>

                <div>
                  <div className="text-slate-400 font-mono uppercase text-[10px] font-bold mb-1">
                    Senior Rater Potential Assessment
                  </div>
                  <p className="text-emerald-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    ✦ {rev.potentialAssessment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Announcement Modal */}
      {isPublishOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              ISSUE COMMAND DIRECTIVE / ANNOUNCEMENT
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Transmit official military order, inspection notice, or administrative policy.
            </p>

            <form onSubmit={handlePublishSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Directive Subject / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANDATORY SENSITIVE ITEMS INVENTORY"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Priority Classification</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Flash Directive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="POLICY">Command Policy</option>
                    <option value="CEREMONY">Ceremonial / Promotion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Issuing Commander / Authority</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Directive Orders & Instructions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the command directives, compliance deadlines, and responsible officers..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Transmit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Performance Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              RECORD NCO / OFFICER EVALUATION (OER / NCOER)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Authorized performance appraisal and promotion recommendation.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Rated Soldier</label>
                <select
                  value={reviewPersonnelId}
                  onChange={(e) => setReviewPersonnelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
                >
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.rank} {p.lastName}, {p.firstName} - {p.dutyPosition}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Review Period</label>
                  <input
                    type="text"
                    required
                    value={reviewPeriod}
                    onChange={(e) => setReviewPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Rating Classification</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="EXCEEDS_STANDARDS">Exceeds Standards</option>
                    <option value="MEETS_STANDARDS">Meets Standards</option>
                    <option value="MARGINAL">Marginal</option>
                    <option value="UNSATISFACTORY">Unsatisfactory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Duty Performance Evaluation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail achievements, leadership accountability, inspection results..."
                  value={dutyPerformanceSummary}
                  onChange={(e) => setDutyPerformanceSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Promotion Potential Assessment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Promote ahead of peers to Sergeant First Class."
                  value={potentialAssessment}
                  onChange={(e) => setPotentialAssessment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-semibold"
                >
                  Sign & File Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
