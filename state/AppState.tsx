import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { PatientVM } from '../lib/fhir/mappers';
import type { Role } from '../lib/roles';

// All workflow state lives in memory only. Nothing is persisted to the device or written to a
// FHIR server, so closing the app leaves no patient information behind.

export type CheckInStatus = 'notArrived' | 'arrived' | 'roomed' | 'completed';

export interface CheckIn {
  patient: PatientVM;
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
  setCheckIn: (patient: PatientVM, status: CheckInStatus) => void;
  /** Replaces all check-ins at once, used by the simulated shift on the Today screen. */
  replaceCheckIns: (entries: { patient: PatientVM; status: CheckInStatus }[]) => void;
  /** Patients most recently loaded by the Patients list; the PAP queue works from this set. */
  loadedPatients: PatientVM[];
  setLoadedPatients: (patients: PatientVM[]) => void;
  pap: Record<string, PapProgress>;
  updatePap: (itemKey: string, change: Partial<PapProgress>) => void;
  /** Incremented when the data source changes so list screens reload. */
  dataEpoch: number;
  bumpDataEpoch: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children, initialRole = 'nurse' }: { children?: ReactNode | ReactNode[]; initialRole?: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [checkIns, setCheckIns] = useState<Record<string, CheckIn>>({});
  const [loadedPatients, setLoadedPatients] = useState<PatientVM[]>([]);
  const [pap, setPap] = useState<Record<string, PapProgress>>({});
  const [dataEpoch, setDataEpoch] = useState(0);

  const setCheckIn = useCallback(
    (patient: PatientVM, status: CheckInStatus) =>
      setCheckIns((prev) => ({ ...prev, [patient.key]: { patient, status, updatedAt: new Date().toISOString(), updatedBy: role } })),
    [role],
  );

  const replaceCheckIns = useCallback(
    (entries: { patient: PatientVM; status: CheckInStatus }[]) => {
      const now = Date.now();
      const next: Record<string, CheckIn> = {};
      entries.forEach((e, i) => {
        // Stagger times so the simulated shift reads like a morning of arrivals.
        next[e.patient.key] = { ...e, updatedAt: new Date(now - (entries.length - i) * 7 * 60_000).toISOString(), updatedBy: 'frontDesk' };
      });
      setCheckIns(next);
    },
    [],
  );

  const updatePap = useCallback(
    (itemKey: string, change: Partial<PapProgress>) =>
      setPap((prev) => ({ ...prev, [itemKey]: { ...(prev[itemKey] ?? { step: 'identified', notes: '' }), ...change } })),
    [],
  );

  const bumpDataEpoch = useCallback(() => setDataEpoch((n) => n + 1), []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      checkIns,
      setCheckIn,
      replaceCheckIns,
      loadedPatients,
      setLoadedPatients,
      pap,
      updatePap,
      dataEpoch,
      bumpDataEpoch,
    }),
    [role, checkIns, setCheckIn, replaceCheckIns, loadedPatients, pap, updatePap, dataEpoch, bumpDataEpoch],
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
