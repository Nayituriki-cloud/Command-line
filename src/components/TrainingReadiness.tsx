import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Users,
  Target,
  Flame,
  X,
} from 'lucide-react';
import { TrainingCourse, Personnel, Unit } from '../types/commander';

interface TrainingReadinessProps {
  trainingCourses: TrainingCourse[];
  personnel: Personnel[];
  units: Unit[];
  canEdit: boolean;
  onAddTrainingCourse: (course: Omit<TrainingCourse, 'id'>) => void;
  onEnrollPersonnel: (courseId: string, personnelId: string) => void;
}

export const TrainingReadiness: React.FC<TrainingReadinessProps> = ({
  trainingCourses,
  personnel,
  units,
  canEdit,
  onAddTrainingCourse,
  onEnrollPersonnel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);

  // New course form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TrainingCourse['category']>('MARKSMANSHIP');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-11-25');
  const [newHours, setNewHours] = useState(8);
  const [newLocation, setNewLocation] = useState('Range Complex 4');
  const [newInstructor, setNewInstructor] = useState('MSG Rodriguez');
  const [newCapacity, setNewCapacity] = useState(20);

  // Find overdue personnel (> 180 days since last test or score < 400)
  const overdueFitnessPersonnel = personnel.filter((p) => {
    return p.status === 'PENDING_REVIEW' || p.apftScore < 500;
  });

  const filteredCourses = trainingCourses.filter((c) => {
    return selectedCategory === 'ALL' || c.category === selectedCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onAddTrainingCourse({
      title: newTitle,
      category: newCategory,
      unitId: newUnitId,
      scheduledDate: newDate,
      durationHours: Number(newHours),
      location: newLocation,
      instructor: newInstructor,
      status: 'SCHEDULED',
      enrolledPersonnelIds: [],
      maxCapacity: Number(newCapacity),
    });

    setIsAddCourseOpen(false);
    setNewTitle('');
  };

  const getPersonnelName = (id: string) => {
    const p = personnel.find((pers) => pers.id === id);
    return p ? `${p.rank} ${p.lastName}` : 'Soldier';
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            TRAINING READINESS, FITNESS & QUALIFICATIONS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical Fitness Assessments (ACFT), weapons marksmanship certifications, and tactical school rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-2 font-mono focus:border-purple-500"
          >
            <option value="ALL">All Training Modules</option>
            <option value="FITNESS">Physical Fitness (ACFT)</option>
            <option value="MARKSMANSHIP">Marksmanship & Weapons</option>
            <option value="MEDICAL_LIFESAVER">Combat Lifesaver (CLS)</option>
            <option value="CBRN">CBRN Defense</option>
            <option value="LEADERSHIP">Leadership Academies</option>
            <option value="CYBER_SECURITY">Cyber & Security</option>
          </select>

          {canEdit && (
            <button
              onClick={() => setIsAddCourseOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Course</span>
            </button>
          )}
        </div>
      </div>

      {/* Fitness Overdue Alert Callout */}
      {overdueFitnessPersonnel.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-4 shadow">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs font-heading mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>FITNESS & ASSESSMENT DISCREPANCY AUDIT ({overdueFitnessPersonnel.length} SOLDIERS)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {overdueFitnessPersonnel.map((soldier) => (
              <div
                key={soldier.id}
                className="bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200">
                    {soldier.rank} {soldier.lastName}, {soldier.firstName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Score: <span className="text-amber-400 font-bold">{soldier.apftScore}</span> / 600 • Last: {soldier.lastPftDate}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                  RETEST REQ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCourses.map((course) => {
          const unit = units.find((u) => u.id === course.unitId);
          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-slate-900 border border-slate-800 hover:border-purple-600/60 p-4 rounded-xl shadow cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {course.category.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {course.scheduledDate}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-slate-100 text-sm mb-1.5 line-clamp-1">
                  {course.title}
                </h3>

                <div className="text-xs text-slate-400 space-y-1 mt-2">
                  <div className="line-clamp-1">
                    <span className="text-slate-500">Location:</span> {course.location}
                  </div>
                  <div>
                    <span className="text-slate-500">Instructor:</span> {course.instructor}
                  </div>
                  <div>
                    <span className="text-slate-500">Duration:</span> {course.durationHours} Hours
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  Enrolled: <strong className="text-emerald-400">{course.enrolledPersonnelIds.length}</strong> / {course.maxCapacity}
                </span>
                <span className="text-purple-400 hover:text-purple-300 font-medium">Details & Roster →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Detail & Enrollment Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded uppercase">
                  {selectedCourse.category}
                </span>
                <h3 className="font-heading font-bold text-slate-100 text-base mt-1">
                  {selectedCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400">Date:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCourse.scheduledDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>{' '}
                  <span className="font-mono text-slate-200">{selectedCourse.durationHours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>{' '}
                  <span className="text-slate-200">{selectedCourse.location}</span>
                </div>
                <div>
                  <span className="text-slate-400">Instructor:</span>{' '}
                  <span className="text-slate-200">{selectedCourse.instructor}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-400 uppercase font-bold mb-2 flex items-center justify-between">
                  <span>Enrolled Personnel ({selectedCourse.enrolledPersonnelIds.length})</span>
                  <span>Capacity: {selectedCourse.maxCapacity}</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {selectedCourse.enrolledPersonnelIds.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">No personnel enrolled yet.</div>
                  ) : (
                    selectedCourse.enrolledPersonnelIds.map((pId) => (
                      <div
                        key={pId}
                        className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-200">{getPersonnelName(pId)}</span>
                        <span className="text-emerald-400 font-mono text-[11px]">Enrolled</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-mono mb-1">Enroll Additional Soldier</label>
                  <div className="flex gap-2">
                    <select
                      id="enrollSelect"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                    >
                      {personnel
                        .filter((p) => !selectedCourse.enrolledPersonnelIds.includes(p.id))
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.rank} {p.lastName}, {p.firstName}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById('enrollSelect') as HTMLSelectElement;
                        if (select && select.value) {
                          onEnrollPersonnel(selectedCourse.id, select.value);
                          setSelectedCourse((prev) =>
                            prev ? { ...prev, enrolledPersonnelIds: [...prev.enrolledPersonnelIds, select.value] } : null
                          );
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Training Course Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-heading font-bold text-slate-100 text-base mb-1">
              SCHEDULE TRAINING COURSE / ASSESSMENT
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter curriculum details, instructor credentials, and slot allocation.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combat Lifesaver Certification"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value="FITNESS">Physical Fitness</option>
                    <option value="MARKSMANSHIP">Marksmanship</option>
                    <option value="MEDICAL_LIFESAVER">Medical / Lifesaver</option>
                    <option value="CBRN">CBRN Defense</option>
                    <option value="LEADERSHIP">Leadership</option>
                    <option value="CYBER_SECURITY">Cyber Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">Capacity (Max Pax)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Facility / Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Lead Instructor</label>
                <input
                  type="text"
                  required
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-semibold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
