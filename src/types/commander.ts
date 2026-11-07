/**
 * COMMANDER 360 - Type Definitions
 * Professional Military Personnel & Unit Management System
 */

export type UserRole =
  | 'GENERAL_COMMANDER'
  | 'BRIGADE_COMMANDER'
  | 'BATTALION_COMMANDER'
  | 'COMPANY_COMMANDER'
  | 'PLATOON_COMMANDER'
  | 'SECTION_LEADER'
  | 'PERSONNEL_ADMIN'
  | 'INDIVIDUAL_SOLDIER';

export type EchelonLevel =
  | 'GENERAL'
  | 'BRIGADE'
  | 'BATTALION'
  | 'COMPANY'
  | 'PLATOON'
  | 'SECTION';

export type PersonnelStatus =
  | 'AVAILABLE'
  | 'LEAVE'
  | 'TRAINING'
  | 'UNAVAILABLE'
  | 'PENDING_REVIEW';

export type MilitaryRank =
  | 'GEN'  // General
  | 'LTG'  // Lieutenant General
  | 'MG'   // Major General
  | 'BG'   // Brigadier General
  | 'COL'  // Colonel
  | 'LTC'  // Lieutenant Colonel
  | 'MAJ'  // Major
  | 'CPT'  // Captain
  | '1LT'  // First Lieutenant
  | '2LT'  // Second Lieutenant
  | 'CW4'  // Chief Warrant Officer 4
  | 'CW3'  // Chief Warrant Officer 3
  | 'WO1'  // Warrant Officer 1
  | 'CSM'  // Command Sergeant Major
  | '1SG'  // First Sergeant
  | 'MSG'  // Master Sergeant
  | 'SFC'  // Sergeant First Class
  | 'SSG'  // Staff Sergeant
  | 'SGT'  // Sergeant
  | 'CPL'  // Corporal
  | 'SPC'  // Specialist
  | 'PFC'  // Private First Class
  | 'PV2';  // Private

export type SecurityClearance = 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'NONE';

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  echelon: EchelonLevel;
  parentId: string | null;
  commanderId: string;
  commanderRank: MilitaryRank;
  commanderName: string;
  location: string;
  authorizedStrength: number;
  assignedStrength: number;
  readinessRate: number; // percentage 0-100
}

export interface Personnel {
  id: string;
  serviceNumber: string; // e.g. "RA-9482103"
  rank: MilitaryRank;
  firstName: string;
  lastName: string;
  callsign?: string;
  unitId: string;
  dutyPosition: string; // e.g. "Alpha Co Commander", "1st Squad Leader", "Combat Medic"
  mos: string; // Military Occupational Specialty (e.g. "11B Infantryman", "68W Combat Medic")
  status: PersonnelStatus;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  dateOfEnlistment: string;
  clearance: SecurityClearance;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  apftScore: number; // 0-600
  lastPftDate: string;
  weaponsQual: 'EXPERT' | 'SHARPSHOOTER' | 'MARKSMAN' | 'EXPIRED';
  qualifications: string[]; // e.g. ["Airborne", "Ranger", "CLS", "Combatives Lv2"]
  awards: string[]; // e.g. ["Army Commendation Medal", "Meritorious Service Medal"]
  notes?: string;
}

export type ShiftType =
  | 'OD_OFFICER_OF_DAY'
  | 'SDO_STAFF_DUTY_OFFICER'
  | 'CQ_CHARGE_OF_QUARTERS'
  | 'ARMORY_GUARD'
  | 'GATE_SENTRY'
  | 'VEHICLE_INSPECTION'
  | 'FIRE_WATCH';

export interface DutyAssignment {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  unitId: string;
  primaryPersonnelId: string;
  alternatePersonnelId: string;
  status: 'SCHEDULED' | 'ON_DUTY' | 'COMPLETED' | 'RELIEVED' | 'MISSED';
  timeStart: string;
  timeEnd: string;
  handoverNotes?: string;
  completedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  personnelId: string;
  unitId: string;
  status: 'PRESENT' | 'EXCUSED_LEAVE' | 'EXCUSED_TRAINING' | 'MEDICAL_QUARTERS' | 'UNEXCUSED_ABSENCE';
  checkInTime?: string;
  verifiedBy?: string;
  remarks?: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'MARKSMANSHIP' | 'FITNESS' | 'MEDICAL_LIFESAVER' | 'CBRN' | 'LEADERSHIP' | 'CYBER_SECURITY' | 'VEHICLE_OPS';
  unitId: string;
  scheduledDate: string;
  durationHours: number;
  location: string;
  instructor: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  enrolledPersonnelIds: string[];
  maxCapacity: number;
}

export interface EquipmentItem {
  id: string;
  serialNumber: string;
  name: string;
  category: 'COMMUNICATION' | 'VEHICLE' | 'OFFICE_IT' | 'UNIFORM_KIT' | 'SAFETY_OPTICS';
  unitId: string;
  assignedToPersonnelId?: string;
  condition: 'SERVICEABLE' | 'REQUIRES_MAINTENANCE' | 'IN_REPAIR' | 'CRITICAL_DEADLINE';
  lastInspectionDate: string;
  nextInspectionDue: string;
  location: string;
  notes?: string;
}

export interface WelfareRequest {
  id: string;
  personnelId: string;
  type: 'CONVALESCENT_LEAVE' | 'EMERGENCY_LEAVE' | 'FAMILY_SUPPORT' | 'ACCOMMODATION' | 'TRANSITION_ASSISTANCE';
  submissionDate: string;
  startDate?: string;
  endDate?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewerNotes?: string;
}

export interface OfficialAnnouncement {
  id: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'ROUTINE';
  category: 'POLICY' | 'CEREMONY' | 'ADMINISTRATIVE' | 'INSPECTION';
  publishedDate: string;
  authorRankName: string;
  authorRole: string;
  targetUnitId: string; // 'ALL' or specific unitId
  content: string;
  isAcknowledged?: boolean;
}

export interface PerformanceReview {
  id: string;
  personnelId: string;
  reviewPeriod: string; // e.g. "FY26 Q3"
  rating: 'EXCEEDS_STANDARDS' | 'MEETS_STANDARDS' | 'MARGINAL' | 'UNSATISFACTORY';
  dutyPerformanceSummary: string;
  potentialAssessment: string;
  reviewerId: string;
  reviewerName: string;
  date: string;
}
