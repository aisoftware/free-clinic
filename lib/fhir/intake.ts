import type { FeeTier } from '../rules/fpl';
import type { IntakeLanguage } from '../i18n/intake';
import type { Role } from '../roles';
import type { Bundle, Consent, Patient, Resource } from './types';

export type Point = { x: number; y: number };
export type Stroke = Point[];

export interface IntakeDemographics {
  givenName: string;
  familyName: string;
  birthDate: string; // YYYY-MM-DD
  phoneDigits: string; // 10 digits
  language: IntakeLanguage;
}

export interface IntakeHousehold {
  size: number;
  monthlyIncome: number;
  fplPercent: number;
  fplYear: number;
  tier: FeeTier;
}

export interface SignedConsent {
  strokes: Stroke[];
  width: number;
  height: number;
  signedAt: string;
  witnessRole: Role;
  witnessLabel: string;
}

const CLINIC = { display: 'Community Free Clinic' };
const EXT = 'urn:example:community-free-clinic:extension';

/** Demo-grade UUID for bundle-local references; a server would assign real ids on create. */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** ASCII-only base64, avoiding differences in btoa availability across JS engines. */
function base64Ascii(input: string): string {
  let out = '';
  for (let i = 0; i < input.length; i += 3) {
    const a = input.charCodeAt(i);
    const b = input.charCodeAt(i + 1);
    const c = input.charCodeAt(i + 2);
    const triple = (a << 16) | ((b || 0) << 8) | (c || 0);
    out += B64[(triple >> 18) & 63] + B64[(triple >> 12) & 63];
    out += Number.isNaN(b) ? '=' : B64[(triple >> 6) & 63];
    out += Number.isNaN(c) ? '=' : B64[triple & 63];
  }
  return out;
}

export function strokesToPath(strokes: Stroke[]): string {
  return strokes
    .filter((s) => s.length > 0)
    .map((s) => {
      const [first, ...rest] = s;
      // A tap with no movement still leaves a visible dot.
      const tail = rest.length ? rest : [{ x: first.x + 0.5, y: first.y + 0.5 }];
      return `M${Math.round(first.x)} ${Math.round(first.y)}` + tail.map((p) => ` L${Math.round(p.x)} ${Math.round(p.y)}`).join('');
    })
    .join(' ');
}

export function signatureSvg(consent: Pick<SignedConsent, 'strokes' | 'width' | 'height'>): string {
  const w = Math.round(consent.width);
  const h = Math.round(consent.height);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<path d="${strokesToPath(consent.strokes)}" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    '</svg>'
  );
}

function consentResource(
  kind: 'treatment' | 'privacy',
  signed: SignedConsent,
  patientRef: string,
  patientName: string,
): Consent {
  const treatment = kind === 'treatment';
  return {
    resourceType: 'Consent',
    status: 'active',
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: treatment ? 'treatment' : 'patient-privacy',
          display: treatment ? 'Treatment' : 'Privacy Consent',
        },
      ],
    },
    category: [
      {
        coding: [
          treatment
            ? { system: 'http://loinc.org', code: '59284-0', display: 'Patient Consent' }
            : { system: 'http://loinc.org', code: '57016-8', display: 'Privacy policy acknowledgment Document' },
        ],
      },
    ],
    patient: { reference: patientRef, display: patientName },
    dateTime: signed.signedAt,
    performer: [{ reference: patientRef, display: patientName }],
    organization: [CLINIC],
    // R4 requires a policy or policyRule. The privacy acknowledgment maps to the HIPAA Notice of
    // Privacy Practices code; consent to treat points at the clinic's own form version.
    ...(treatment
      ? { policy: [{ uri: 'urn:example:community-free-clinic:consent-to-treat:v1' }] }
      : { policyRule: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/consentpolicycodes', code: 'hipaa-npp', display: 'HIPAA Notice of Privacy Practices' }] } }),
    provision: { type: 'permit' },
    // The witnessing volunteer is recorded by role only. Volunteer identity would come from the
    // authenticated session in a real deployment, not from free text typed on a shared tablet.
    verification: [
      { verified: true, verifiedWith: { display: `${signed.witnessLabel} volunteer (witness)` }, verificationDate: signed.signedAt },
    ],
    sourceAttachment: {
      contentType: 'image/svg+xml',
      title: treatment ? 'Consent to treat signature' : 'Notice of Privacy Practices acknowledgment signature',
      creation: signed.signedAt,
      data: base64Ascii(signatureSvg(signed)),
    },
  };
}

/**
 * Builds the intake as a FHIR collection Bundle: one Patient and two Consents. Household income
 * stays out of the resources; only the derived FPL percentage and fee tier are recorded, which is
 * all the clinic needs to apply its sliding fee.
 */
export function buildIntakeBundle(
  demo: IntakeDemographics,
  household: IntakeHousehold,
  consents: { treatment: SignedConsent; privacy: SignedConsent },
  now = new Date(),
): Bundle<Resource> {
  const patientUrl = `urn:uuid:${uuid()}`;
  const name = `${demo.givenName.trim()} ${demo.familyName.trim()}`;
  const phone = demo.phoneDigits;

  const patient: Patient = {
    resourceType: 'Patient',
    meta: { lastUpdated: now.toISOString() },
    name: [{ use: 'official', family: demo.familyName.trim(), given: demo.givenName.trim().split(/\s+/) }],
    birthDate: demo.birthDate,
    telecom: [{ system: 'phone', value: `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`, use: 'mobile' }],
    communication: [
      {
        language: {
          coding: [{ system: 'urn:ietf:bcp:47', code: demo.language, display: demo.language === 'es' ? 'Spanish' : 'English' }],
          text: demo.language === 'es' ? 'Spanish' : 'English',
        },
        preferred: true,
      },
    ],
    extension: [
      { url: `${EXT}:household-size`, valueInteger: household.size },
      { url: `${EXT}:fpl-percent-${household.fplYear}`, valueDecimal: household.fplPercent },
      { url: `${EXT}:sliding-fee-tier`, valueString: household.tier.id },
    ],
  };

  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      { fullUrl: patientUrl, resource: patient },
      { fullUrl: `urn:uuid:${uuid()}`, resource: consentResource('treatment', consents.treatment, patientUrl, name) },
      { fullUrl: `urn:uuid:${uuid()}`, resource: consentResource('privacy', consents.privacy, patientUrl, name) },
    ],
  };
}
