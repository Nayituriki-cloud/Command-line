import React, { useState, useEffect } from 'react';
import { UserRole } from './types/commander';
import {
  INITIAL_UNITS,
  INITIAL_PERSONNEL,
  INITIAL_DUTY_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_EQUIPMENT,
  INITIAL_TRAINING,
  INITIAL_WELFARE_REQUESTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_REVIEWS,
} from './data/mockMilitaryData';
import {
  ROLE_DEFINITIONS,
  filterUnitsForRole,
  filterPersonnelForRole,
} from './utils/roleAccess';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { CommandDashboard } from './components/CommandDashboard';
import { PersonnelManagement } from './components/PersonnelManagement';
import { OrganizationalHierarchy } from './components/OrganizationalHierarchy';
import { DutyManagement } from './components/DutyManagement';
import { AttendanceAccountability } from './components/AttendanceAccountability';
import { TrainingReadiness } from './components/TrainingReadiness';
import { EquipmentInventory } from './components/EquipmentInventory';
import { PersonnelWelfare } from './components/PersonnelWelfare';
import { OfficialCommunications } from './components/OfficialCommunications';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

export default function App() {
  // Active Commander Role (default: Battalion Commander to showcase deep echelon management)
  const [currentRole, setCurrentRole] = useState<UserRole>('BATTALION_COMMANDER');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data States with LocalStorage fallback
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('c360_units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [personnel, setPersonnel] = useState(() => {
    const saved = localStorage.getItem('c360_personnel');
    return saved ? JSON.parse(saved) : INITIAL_PERSONNEL;
  });

  const [dutyAssignments, setDutyAssignments] = useState(() => {
    const saved = localStorage.getItem('c360_duty');
    return saved ? JSON.parse(saved) : INITIAL_DUTY_ASSIGNMENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('c360_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [equipment, setEquipment] = useState(() => {
    const saved = localStorage.getItem('c360_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [trainingCourses, setTrainingCourses] = useState(() => {
    const saved = localStorage.getItem('c360_training');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING;
  });

  const [welfareRequests, setWelfareRequests] = useState(() => {
    const saved = localStorage.getItem('c360_welfare');
    return saved ? JSON.parse(saved) : INITIAL_WELFARE_REQUESTS;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('c360_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('c360_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Modal / Drawer visibility
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('c360_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('c360_personnel', JSON.stringify(personnel));
  }, [personnel]);

  useEffect(() => {
    localStorage.setItem('c360_duty', JSON.stringify(dutyAssignments));
  }, [dutyAssignments]);

  useEffect(() => {
    localStorage.setItem('c360_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('c360_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('c360_welfare', JSON.stringify(welfareRequests));
  }, [welfareRequests]);

  useEffect(() => {
    localStorage.setItem('c360_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('c360_training', JSON.stringify(trainingCourses));
  }, [trainingCourses]);

  useEffect(() => {
    localStorage.setItem('c360_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Scoped Data for Current Role
  const scopedUnits = filterUnitsForRole(units, currentRole);
  const scopedPersonnel = filterPersonnelForRole(personnel, units, currentRole);
  const roleConfig = ROLE_DEFINITIONS[currentRole];

  // Overall Statistics for Scoped Personnel
  const totalCount = scopedPersonnel.length;
  const availableCount = scopedPersonnel.filter((p) => p.status === 'AVAILABLE').length;
  const readinessRate = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 100;

  // Handlers for Command Operations
  const handleAddPersonnel = (newSoldierData: any) => {
    const newSoldier = {
      ...newSoldierData,
      id: `pers-${Date.now()}`,
    };
    setPersonnel((prev: any) => [newSoldier, ...prev]);
  };

  const handleUpdatePersonnel = (id: string, updates: any) => {
    setPersonnel((prev: any[]) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleTransferPersonnel = (soldierId: string, newUnitId: string, remarks: string) => {
    setPersonnel((prev: any[]) =>
      prev.map((p) =>
        p.id === soldierId
          ? {
              ...p,
              unitId: newUnitId,
              notes: `${p.notes ? p.notes + ' | ' : ''}Transfer Order executed to unit ${newUnitId}: ${remarks}`,
            }
          : p
      )
    );
  };

  const handleAddUnit = (newUnitData: any) => {
    const newUnit = {
      ...newUnitData,
      id: `unit-${Date.now()}`,
    };
    setUnits((prev: any) => [...prev, newUnit]);
  };

  const handleUpdateUnitCommander = (unitId: string, commanderId: string) => {
    const commander = personnel.find((p: any) => p.id === commanderId);
    if (!commander) return;
    setUnits((prev: any[]) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              commanderId,
              commanderRank: commander.rank,
              commanderName: `${commander.lastName}, ${commander.firstName}`,
            }
          : u
      )
    );
  };

  const handleAddDuty = (newDutyData: any) => {
    const newDuty = {
      ...newDutyData,
      id: `duty-${Date.now()}`,
    };
    setDutyAssignments((prev: any) => [newDuty, ...prev]);
  };

  const handleUpdateDutyStatus = (dutyId: string, status: any, handoverNotes?: string) => {
    setDutyAssignments((prev: any[]) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              status,
              ...(handoverNotes ? { handoverNotes } : {}),
            }
          : d
      )
    );
  };

  const handleUpdateAttendance = (recordId: string, status: any, remarks?: string) => {
    setAttendanceRecords((prev: any[]) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status,
              ...(remarks ? { remarks } : {}),
            }
          : r
      )
    );
  };

  const handleCheckInSoldier = (personnelId: string, unitId: string) => {
    const todayStr = '2026-11-07';
    const existing = attendanceRecords.find(
      (r: any) => r.date === todayStr && r.personnelId === personnelId
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    if (existing) {
      setAttendanceRecords((prev: any[]) =>
        prev.map((r) =>
          r.id === existing.id
            ? { ...r, status: 'PRESENT', checkInTime: timeStr, verifiedBy: roleConfig.rankTitle }
            : r
        )
      );
    } else {
      const newRec = {
        id: `att-${Date.now()}`,
        date: todayStr,
        personnelId,
        unitId,
        status: 'PRESENT',
        checkInTime: timeStr,
        verifiedBy: roleConfig.rankTitle,
      };
      setAttendanceRecords((prev: any) => [newRec, ...prev]);
    }
  };

  const handleAddEquipment = (newItemData: any) => {
    const newItem = {
      ...newItemData,
      id: `eq-${Date.now()}`,
    };
    setEquipment((prev: any) => [newItem, ...prev]);
  };

  const handleUpdateEquipmentCondition = (itemId: string, condition: any) => {
    setEquipment((prev: any[]) =>
      prev.map((eq) => (eq.id === itemId ? { ...eq, condition } : eq))
    );
  };

  const handleReassignEquipment = (itemId: string, soldierId?: string) => {
    setEquipment((prev: any[]) =>
      prev.map((eq) =>
        eq.id === itemId ? { ...eq, assignedToPersonnelId: soldierId } : eq
      )
    );
  };

  const handleAddTrainingCourse = (newCourseData: any) => {
    const newCourse = {
      ...newCourseData,
      id: `train-${Date.now()}`,
    };
    setTrainingCourses((prev: any) => [newCourse, ...prev]);
  };

  const handleEnrollPersonnel = (courseId: string, personnelId: string) => {
    setTrainingCourses((prev: any[]) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrolledPersonnelIds: Array.from(new Set([...c.enrolledPersonnelIds, personnelId])),
            }
          : c
      )
    );
  };

  const handleApproveWelfareRequest = (requestId: string, remarks?: string) => {
    setWelfareRequests((prev: any[]) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              reviewedBy: roleConfig.rankTitle,
              reviewerNotes: remarks || 'Approved by Command Authority.',
            }
          : r
      )
    );
  };

  const handleRejectWelfareRequest = (requestId: string, remarks?: string) => {
    setWelfareRequests((prev: any[]) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              reviewedBy: roleConfig.rankTitle,
              reviewerNotes: remarks || 'Disapproved in accordance with unit operational posture.',
            }
          : r
      )
    );
  };

  const handleSubmitWelfareRequest = (newRequestData: any) => {
    const newReq = {
      ...newRequestData,
      id: `welf-${Date.now()}`,
    };
    setWelfareRequests((prev: any) => [newReq, ...prev]);
  };

  const handlePublishAnnouncement = (newAnnouncementData: any) => {
    const newAnn = {
      ...newAnnouncementData,
      id: `ann-${Date.now()}`,
    };
    setAnnouncements((prev: any) => [newAnn, ...prev]);
  };

  const handleAddReview = (newReviewData: any) => {
    const newRev = {
      ...newReviewData,
      id: `rev-${Date.now()}`,
    };
    setReviews((prev: any) => [newRev, ...prev]);
  };

  const pendingApprovalsCount = welfareRequests.filter((r: any) => r.status === 'PENDING').length;
  const unacknowledgedCount = announcements.filter((a: any) => !a.isAcknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Tactical Top Bar & Scoped Echelon Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onQuickMuster={() => setActiveTab('attendance')}
        readinessRate={readinessRate}
        totalPersonnel={totalCount}
        availablePersonnel={availableCount}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        unacknowledgedNoticesCount={unacknowledgedCount}
      />

      {/* Active Tab Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'dashboard' && (
          <CommandDashboard
            personnel={scopedPersonnel}
            units={scopedUnits}
            dutyAssignments={dutyAssignments}
            attendanceRecords={attendanceRecords}
            welfareRequests={welfareRequests}
            announcements={announcements}
            onNavigate={setActiveTab}
            onApproveRequest={(id) => handleApproveWelfareRequest(id)}
            onRejectRequest={(id) => handleRejectWelfareRequest(id)}
            currentEchelonLabel={roleConfig.label}
          />
        )}

        {activeTab === 'personnel' && (
          <PersonnelManagement
            personnel={scopedPersonnel}
            units={scopedUnits}
            canEdit={roleConfig.canEditPersonnel}
            onAddPersonnel={handleAddPersonnel}
            onUpdatePersonnel={handleUpdatePersonnel}
            onTransferPersonnel={handleTransferPersonnel}
          />
        )}

        {activeTab === 'hierarchy' && (
          <OrganizationalHierarchy
            units={scopedUnits}
            personnel={scopedPersonnel}
            canEdit={roleConfig.canEditPersonnel}
            onAddUnit={handleAddUnit}
            onUpdateUnitCommander={handleUpdateUnitCommander}
          />
        )}

        {activeTab === 'duty' && (
          <DutyManagement
            dutyAssignments={dutyAssignments}
            personnel={scopedPersonnel}
            units={scopedUnits}
            canAssign={roleConfig.canAssignDuties}
            onAddDuty={handleAddDuty}
            onUpdateDutyStatus={handleUpdateDutyStatus}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceAccountability
            personnel={scopedPersonnel}
            units={scopedUnits}
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={handleUpdateAttendance}
            onCheckInSoldier={handleCheckInSoldier}
          />
        )}

        {activeTab === 'training' && (
          <TrainingReadiness
            trainingCourses={trainingCourses}
            personnel={scopedPersonnel}
            units={scopedUnits}
            canEdit={roleConfig.canEditPersonnel}
            onAddTrainingCourse={handleAddTrainingCourse}
            onEnrollPersonnel={handleEnrollPersonnel}
          />
        )}

        {activeTab === 'logistics' && (
          <EquipmentInventory
            equipment={equipment}
            personnel={scopedPersonnel}
            units={scopedUnits}
            canManage={roleConfig.canManageInventory}
            onAddEquipment={handleAddEquipment}
            onUpdateCondition={handleUpdateEquipmentCondition}
            onReassignEquipment={handleReassignEquipment}
          />
        )}

        {activeTab === 'welfare' && (
          <PersonnelWelfare
            welfareRequests={welfareRequests}
            personnel={scopedPersonnel}
            canApprove={roleConfig.canApproveLeaves}
            onApproveRequest={handleApproveWelfareRequest}
            onRejectRequest={handleRejectWelfareRequest}
            onSubmitRequest={handleSubmitWelfareRequest}
          />
        )}

        {activeTab === 'comms' && (
          <OfficialCommunications
            announcements={announcements}
            reviews={reviews}
            personnel={scopedPersonnel}
            units={scopedUnits}
            canPublish={roleConfig.canEditPersonnel || roleConfig.canAssignDuties}
            onPublishAnnouncement={handlePublishAnnouncement}
            onAddReview={handleAddReview}
          />
        )}
      </main>

      {/* Official Military Report Generator Modal (Printable & CSV Export) */}
      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        personnel={scopedPersonnel}
        units={scopedUnits}
        dutyAssignments={dutyAssignments}
        attendanceRecords={attendanceRecords}
        equipment={equipment}
      />

      {/* AI Commander Advisor Drawer */}
      <AIAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        personnel={scopedPersonnel}
        units={scopedUnits}
        dutyAssignments={dutyAssignments}
        equipment={equipment}
        currentRoleLabel={roleConfig.label}
      />

      {/* Tactical Status Footer */}
      <footer className="no-print bg-slate-950 border-t border-slate-800/80 py-2.5 px-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>COMMANDER 360 ADMINISTRATIVE SYSTEM • ACTIVE ENCRYPTION TLS 1.3</span>
        </div>
        <div>STRICTLY NON-COMBAT PERSONNEL & LOGISTICAL ADMINISTRATION ONLY</div>
      </footer>
    </div>
  );
}
