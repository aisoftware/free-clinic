// Role-based access, expressed as one table so every gating decision in the app is auditable
// in one place. This mirrors the HIPAA "minimum necessary" standard: each volunteer role sees
// only the information its job at the clinic requires.

export type Role = 'frontDesk' | 'nurse' | 'provider' | 'pharmacy' | 'student';

export const ROLES: { id: Role; label: string; summary: string }[] = [
  { id: 'frontDesk', label: 'Front Desk', summary: 'Registration, check-in, and intake' },
  { id: 'nurse', label: 'Nurse', summary: 'Rooming, vitals, and clinical review' },
  { id: 'provider', label: 'Provider', summary: 'Full clinical record' },
  { id: 'pharmacy', label: 'Pharmacy', summary: 'Medications and patient assistance programs' },
  { id: 'student', label: 'Medical Student', summary: 'Supervised, read-only clinical view' },
];

export type Capability =
  | 'patients.list'
  | 'patient.contact' // phone number
  | 'patient.checkIn' // change arrival status
  | 'chart.conditions'
  | 'chart.medications'
  | 'chart.vitals'
  | 'chart.encounters'
  | 'intake.create'
  | 'pap.view'
  | 'pap.update';

const TABLE: Record<Capability, Role[]> = {
  'patients.list': ['frontDesk', 'nurse', 'provider', 'pharmacy', 'student'],
  // Students do not need to call patients; pharmacy does, to coordinate PAP shipments.
  'patient.contact': ['frontDesk', 'nurse', 'provider', 'pharmacy'],
  // Students observe but do not change workflow state.
  'patient.checkIn': ['frontDesk', 'nurse', 'provider'],
  // Pharmacy sees diagnoses because manufacturer PAP applications require one.
  'chart.conditions': ['nurse', 'provider', 'pharmacy', 'student'],
  'chart.medications': ['nurse', 'provider', 'pharmacy'],
  'chart.vitals': ['nurse', 'provider', 'student'],
  'chart.encounters': ['nurse', 'provider'],
  'intake.create': ['frontDesk', 'nurse'],
  'pap.view': ['pharmacy', 'provider'],
  'pap.update': ['pharmacy'],
};

export function can(role: Role, capability: Capability): boolean {
  return TABLE[capability].includes(role);
}

export function roleLabel(role: Role): string {
  return ROLES.find((r) => r.id === role)?.label ?? role;
}

/** Plain-language reason shown next to a lock icon wherever something is hidden. */
export function lockReason(role: Role, capability: Capability): string {
  const allowed = TABLE[capability].map(roleLabel).join(', ');
  return `Hidden for ${roleLabel(role)} (minimum necessary). Visible to: ${allowed}.`;
}
