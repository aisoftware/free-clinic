// Minimal hand-written FHIR R4 shapes covering only the fields this app reads or writes.
// A full typings package would add bundle weight for hundreds of unused resources.

export type ResourceType =
  | 'Patient'
  | 'Condition'
  | 'MedicationRequest'
  | 'Observation'
  | 'Encounter'
  | 'Coverage'
  | 'Consent';

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

export interface Reference {
  reference?: string;
  display?: string;
}

export interface Period {
  start?: string;
  end?: string;
}

export interface Quantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface Identifier {
  use?: string;
  type?: CodeableConcept;
  system?: string;
  value?: string;
}

export interface HumanName {
  use?: string;
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
}

export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: string;
}

export interface Resource {
  resourceType: ResourceType;
  id?: string;
  meta?: { lastUpdated?: string; profile?: string[] };
}

export interface Patient extends Resource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: { line?: string[]; city?: string; state?: string; postalCode?: string }[];
  communication?: { language: CodeableConcept; preferred?: boolean }[];
  extension?: { url: string; valueString?: string; valueDecimal?: number; valueInteger?: number }[];
}

export interface Condition extends Resource {
  resourceType: 'Condition';
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  code?: CodeableConcept;
  subject: Reference;
  onsetDateTime?: string;
  onsetPeriod?: Period;
  recordedDate?: string;
}

export interface MedicationRequest extends Resource {
  resourceType: 'MedicationRequest';
  status?: string;
  intent?: string;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  authoredOn?: string;
}

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
}

export interface Observation extends Resource {
  resourceType: 'Observation';
  status?: string;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  valueQuantity?: Quantity;
  component?: ObservationComponent[];
}

export interface Encounter extends Resource {
  resourceType: 'Encounter';
  status?: string;
  class?: Coding;
  type?: CodeableConcept[];
  subject: Reference;
  period?: Period;
  reasonCode?: CodeableConcept[];
}

export interface Coverage extends Resource {
  resourceType: 'Coverage';
  status?: string;
  beneficiary: Reference;
  payor?: Reference[];
}

export interface Consent extends Resource {
  resourceType: 'Consent';
  status: 'draft' | 'proposed' | 'active' | 'rejected' | 'inactive' | 'entered-in-error';
  scope: CodeableConcept;
  category: CodeableConcept[];
  patient?: Reference;
  dateTime?: string;
  performer?: Reference[];
  organization?: Reference[];
  policy?: { authority?: string; uri?: string }[];
  policyRule?: CodeableConcept;
  verification?: { verified: boolean; verifiedWith?: Reference; verificationDate?: string }[];
  provision?: { type?: 'deny' | 'permit'; actor?: { role: CodeableConcept; reference: Reference }[] };
  sourceAttachment?: { contentType?: string; data?: string; title?: string; creation?: string };
}

export interface ResourceByType {
  Patient: Patient;
  Condition: Condition;
  MedicationRequest: MedicationRequest;
  Observation: Observation;
  Encounter: Encounter;
  Coverage: Coverage;
  Consent: Consent;
}

export interface Bundle<T extends Resource = Resource> {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: { fullUrl?: string; resource?: T }[];
}

export interface OperationOutcome {
  resourceType: 'OperationOutcome';
  issue?: { severity?: string; code?: string; diagnostics?: string }[];
}
