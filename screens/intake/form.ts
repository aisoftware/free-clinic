import type { Stroke } from '../../lib/fhir/intake';
import type { IntakeLanguage, IntakeStrings } from '../../lib/i18n/intake';
import type { Role } from '../../lib/roles';

export interface ConsentDraft {
  agreed: boolean;
  strokes: Stroke[];
  width: number;
  height: number;
  signedAt: string | null;
  witnessRole: Role | null;
}

export interface IntakeForm {
  language: IntakeLanguage;
  givenName: string;
  familyName: string;
  month: string;
  day: string;
  year: string;
  phone: string;
  householdSize: number;
  monthlyIncome: string;
  treatment: ConsentDraft;
  privacy: ConsentDraft;
}

const emptyConsent = (): ConsentDraft => ({ agreed: false, strokes: [], width: 0, height: 0, signedAt: null, witnessRole: null });

export const emptyForm = (language: IntakeLanguage = 'en'): IntakeForm => ({
  language,
  givenName: '',
  familyName: '',
  month: '',
  day: '',
  year: '',
  phone: '',
  householdSize: 1,
  monthlyIncome: '',
  treatment: emptyConsent(),
  privacy: emptyConsent(),
});

export const digitsOnly = (s: string) => s.replace(/\D/g, '');

/** Returns YYYY-MM-DD for a real, past date of birth, otherwise null. */
export function birthDateOf(form: Pick<IntakeForm, 'month' | 'day' | 'year'>, now = new Date()): string | null {
  const m = Number(form.month);
  const d = Number(form.day);
  const y = Number(form.year);
  if (!Number.isInteger(m) || !Number.isInteger(d) || !Number.isInteger(y)) return null;
  if (y < 1900 || m < 1 || m > 12 || d < 1) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (date > now) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function incomeOf(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, '');
  if (cleaned === '' || !/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

export type Errors = Partial<Record<string, string>>;

export function validateStep(step: number, form: IntakeForm, t: IntakeStrings): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (!form.givenName.trim()) errors.givenName = t.required;
    if (!form.familyName.trim()) errors.familyName = t.required;
    if (!birthDateOf(form)) errors.birthDate = t.invalidDate;
    if (digitsOnly(form.phone).length !== 10) errors.phone = t.invalidPhone;
  }
  if (step === 1) {
    if (incomeOf(form.monthlyIncome) === null) errors.monthlyIncome = t.invalidIncome;
  }
  if (step === 2) {
    for (const key of ['treatment', 'privacy'] as const) {
      if (!form[key].agreed) errors[`${key}Agreed`] = t.needsCheck;
      if (form[key].strokes.length === 0) errors[`${key}Signature`] = t.needsSignature;
    }
  }
  return errors;
}
