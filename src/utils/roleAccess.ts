import { UserRole, Unit, Personnel } from '../types/commander';

export interface RoleConfig {
  role: UserRole;
  label: string;
  rankTitle: string;
  associatedUnitId: string;
  canApproveLeaves: boolean;
  canEditPersonnel: boolean;
  canAssignDuties: boolean;
  canManageInventory: boolean;
  description: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleConfig> = {
  GENERAL_COMMANDER: {
    role: 'GENERAL_COMMANDER',
    label: 'General Commander',
    rankTitle: 'GEN Montgomery (Apex Actual)',
    associatedUnitId: 'unit-gen',
    canApproveLeaves: true,
    canEditPersonnel: true,
    canAssignDuties: true,
    canManageInventory: true,
    description: 'Supreme authorized theater overview across all echelons.',
  },
  BRIGADE_COMMANDER: {
    role: 'BRIGADE_COMMANDER',
    label: 'Brigade Commander',
    rankTitle: 'COL Harrington (Vanguard 6)',
    associatedUnitId: 'unit-bde-1',
    canApproveLeaves: true,
    canEditPersonnel: true,
    canAssignDuties: true,
    canManageInventory: true,
    description: '1st Mechanized Brigade commander. Administers battalion elements.',
  },
  BATTALION_COMMANDER: {
    role: 'BATTALION_COMMANDER',
    label: 'Battalion Commander',
    rankTitle: 'LTC Castillo (Thunder 6)',
    associatedUnitId: 'unit-bn-2',
    canApproveLeaves: true,
    canEditPersonnel: true,
    canAssignDuties: true,
    canManageInventory: true,
    description: '2nd Infantry Battalion commander. Manages company commanders.',
  },
  COMPANY_COMMANDER: {
    role: 'COMPANY_COMMANDER',
    label: 'Company Commander',
    rankTitle: 'CPT Vance (Viper 6)',
    associatedUnitId: 'unit-co-alpha',
    canApproveLeaves: true,
    canEditPersonnel: true,
    canAssignDuties: true,
    canManageInventory: true,
    description: 'Alpha Company Commander. Primary company administrative authority.',
  },
  PLATOON_COMMANDER: {
    role: 'PLATOON_COMMANDER',
    label: 'Platoon Commander',
    rankTitle: '1LT Sterling (Reaper 1)',
    associatedUnitId: 'unit-plt-1',
    canApproveLeaves: false,
    canEditPersonnel: false,
    canAssignDuties: true,
    canManageInventory: true,
    description: '1st Platoon leader. Schedules duties, tracks physical training.',
  },
  SECTION_LEADER: {
    role: 'SECTION_LEADER',
    label: 'Section Leader',
    rankTitle: 'SSG Miller (Hammer 1)',
    associatedUnitId: 'unit-sec-1',
    canApproveLeaves: false,
    canEditPersonnel: false,
    canAssignDuties: false,
    canManageInventory: false,
    description: 'Section 1 leader. Conducts morning muster and accountability.',
  },
  PERSONNEL_ADMIN: {
    role: 'PERSONNEL_ADMIN',
    label: 'Personnel Administrator (S-1)',
    rankTitle: 'SSG Jackson (S-1 NCOIC)',
    associatedUnitId: 'unit-bn-2',
    canApproveLeaves: true,
    canEditPersonnel: true,
    canAssignDuties: false,
    canManageInventory: true,
    description: 'Authorized HR and records administrator. Manages profiles & orders.',
  },
  INDIVIDUAL_SOLDIER: {
    role: 'INDIVIDUAL_SOLDIER',
    label: 'Individual Soldier',
    rankTitle: 'PV2 Myers (Section 1)',
    associatedUnitId: 'unit-sec-1',
    canApproveLeaves: false,
    canEditPersonnel: false,
    canAssignDuties: false,
    canManageInventory: false,
    description: 'Self-service view for personal profile, duty roster and leave requests.',
  },
};

/**
 * Recursively find all child unit IDs under a root unit
 */
export function getSubUnitIds(allUnits: Unit[], rootUnitId: string): string[] {
  const result: string[] = [rootUnitId];
  const directChildren = allUnits.filter((u) => u.parentId === rootUnitId);
  for (const child of directChildren) {
    result.push(...getSubUnitIds(allUnits, child.id));
  }
  return result;
}

/**
 * Filter units accessible to current user role
 */
export function filterUnitsForRole(allUnits: Unit[], role: UserRole): Unit[] {
  if (role === 'GENERAL_COMMANDER' || role === 'PERSONNEL_ADMIN') {
    return allUnits;
  }
  const config = ROLE_DEFINITIONS[role];
  const accessibleUnitIds = new Set(getSubUnitIds(allUnits, config.associatedUnitId));
  return allUnits.filter((u) => accessibleUnitIds.has(u.id));
}

/**
 * Filter personnel accessible to current user role
 */
export function filterPersonnelForRole(
  allPersonnel: Personnel[],
  allUnits: Unit[],
  role: UserRole
): Personnel[] {
  if (role === 'GENERAL_COMMANDER' || role === 'PERSONNEL_ADMIN') {
    return allPersonnel;
  }
  const config = ROLE_DEFINITIONS[role];
  const accessibleUnitIds = new Set(getSubUnitIds(allUnits, config.associatedUnitId));
  return allPersonnel.filter((p) => accessibleUnitIds.has(p.unitId));
}
