import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { PatientVM } from '../lib/fhir/mappers';
import type { Role } from '../lib/roles';

// All workflow state lives in memory only. Nothing is persisted to the device or written to a
// FHIR server, so closing the app leaves no patient information behind.

export type CheckInStatus = 'notArrived' | 'arrived' | 'roomed' | 'completed';

export interface CheckIn {
  status: CheckInStatus;
  updatedAt: string;
  updatedBy: Role;
}

export type PapStep = 'identified' | 'applicationSent' | 'approved' | 'shipped' | 'dispensed';

export interface PapProgress {
  step: PapStep;
  notes: string;
}

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  checkIns: Record<string, CheckIn>;
  setCheckIn: (patientKey: string, status: CheckInStatus) => void;
  /** Patients most recently loaded by the Patients list; the PAP queue works from this set. */
  loadedPatients: PatientVM[];
  setLoadedPatients: (patients: PatientVM[]) => void;
  pap: Record<string, PapProgress>;
  updatePap: (itemKey: string, change: Partial<PapProgress>) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children, initialRole = 'nurse' }: { children: ReactNode; initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [checkIns, setCheckIns] = useState<Record<string, CheckIn>>({});
  const [loadedPatients, setLoadedPatients] = useState<PatientVM[]>([]);
  const [pap, setPap] = useState<Record<string, PapProgress>>({});

  const setCheckIn = useCallback(
    (patientKey: string, status: CheckInStatus) =>
      setCheckIns((prev) => ({ ...prev, [patientKey]: { status, updatedAt: new Date().toISOString(), updatedBy: role } })),
    [role],
  );

  const updatePap = useCallback(
    (itemKey: string, change: Partial<PapProgress>) =>
      setPap((prev) => ({ ...prev, [itemKey]: { ...(prev[itemKey] ?? { step: 'identified', notes: '' }), ...change } })),
    [],
  );

  const value = useMemo(
    () => ({ role, setRole, checkIns, setCheckIn, loadedPatients, setLoadedPatients, pap, updatePap }),
    [role, checkIns, setCheckIn, loadedPatients, pap, updatePap],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(Ctx);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}

export function checkInStatusOf(checkIns: Record<string, CheckIn>, patientKey: string): CheckInStatus {
  return checkIns[patientKey]?.status ?? 'notArrived';
}
