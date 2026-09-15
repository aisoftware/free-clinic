import type { FeeTierId } from '../rules/fpl';
import type { Role } from '../roles';

export type IntakeLanguage = 'en' | 'es';

// Intake is completed with the patient at the front desk, so the whole flow follows the
// patient's preferred language. Language names are shown in their own language on purpose.
export const LANGUAGE_NAMES: Record<IntakeLanguage, string> = { en: 'English', es: 'Español' };

const en = {
  title: 'New patient intake',
  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  steps: ['About you', 'Household', 'Consent', 'Review'],
  back: 'Back',
  next: 'Next',
  review: 'Review',
  required: 'Required',

  preferredLanguage: 'Preferred language',
  givenName: 'First name',
  familyName: 'Last name',
  dateOfBirth: 'Date of birth',
  month: 'Month',
  day: 'Day',
  year: 'Year',
  phone: 'Mobile phone',
  phoneHint: '10 digits, for appointment reminders',
  invalidDate: 'Enter a real date of birth',
  invalidPhone: 'Enter a 10-digit phone number',

  householdSize: 'People in household',
  householdHint: 'Count yourself, a spouse or partner, and anyone you claim as a dependent.',
  fewerPeople: 'Fewer people',
  morePeople: 'More people',
  monthlyIncome: 'Monthly household income before taxes (USD)',
  incomeHint: 'Enter 0 if the household has no income.',
  invalidIncome: 'Enter an amount in dollars',
  fplResult: (percent: number, year: number) => `${percent}% of the ${year} Federal Poverty Level`,
  tierName: (id: FeeTierId) => (id === 'ineligible' ? 'Above the eligibility limit' : `Sliding fee tier ${id}`),
  tierShort: (id: FeeTierId) => (id === 'ineligible' ? 'Not eligible' : `Tier ${id}`),
  visitFee: (usd: number) => (usd === 0 ? 'No charge for visits' : `Visit fee: $${usd}`),
  ineligibleNote: 'Household income is above the clinic limit of 200% FPL. Offer a referral to a community health center.',
  fplNote: 'Eligibility is confirmed with income documents at the first visit.',

  consentToTreatTitle: 'Consent to treat',
  consentToTreatBody:
    'I agree to receive medical care from Community Free Clinic volunteers and staff, including examinations, tests, and treatment my provider recommends. I understand that care is provided by volunteers and that I may refuse any treatment.',
  consentToTreatCheck: 'I have read and agree',
  privacyTitle: 'Notice of Privacy Practices',
  privacyBody:
    "I acknowledge that I received the clinic's Notice of Privacy Practices, which explains how my health information may be used and shared, and my rights regarding that information.",
  privacyCheck: 'I acknowledge that I received the notice',
  signHere: 'Sign here with your finger',
  clear: 'Clear',
  signed: (time: string) => `Signed at ${time}`,
  witnessedBy: (role: string) => `Witnessed by: ${role} volunteer`,
  needsCheck: 'Check the box to continue',
  needsSignature: 'Signature required',

  reviewSummary: 'Summary',
  household: 'Household',
  povertyLevel: 'Federal Poverty Level',
  slidingFee: 'Sliding fee',
  people: (n: number) => (n === 1 ? '1 person' : `${n} people`),
  consents: 'Consents',
  signedStatus: 'Signed',
  jsonTitle: 'FHIR R4 resources',
  jsonNote: 'Generated on this device. Nothing is sent to any server.',
  jsonTruncated: 'Signature image data is shortened on screen; Copy JSON includes all of it.',
  copyJson: 'Copy JSON',
  copied: 'Copied to clipboard',
  startOver: 'Start a new intake',

  roles: {
    frontDesk: 'Front Desk',
    nurse: 'Nurse',
    provider: 'Provider',
    pharmacy: 'Pharmacy',
    student: 'Medical Student',
  } satisfies Record<Role, string>,
};

export type IntakeStrings = typeof en;

const es: IntakeStrings = {
  title: 'Registro de paciente nuevo',
  stepOf: (n, total) => `Paso ${n} de ${total}`,
  steps: ['Sus datos', 'Hogar', 'Consentimiento', 'Revisión'],
  back: 'Atrás',
  next: 'Siguiente',
  review: 'Revisar',
  required: 'Obligatorio',

  preferredLanguage: 'Idioma preferido',
  givenName: 'Nombre',
  familyName: 'Apellido',
  dateOfBirth: 'Fecha de nacimiento',
  month: 'Mes',
  day: 'Día',
  year: 'Año',
  phone: 'Teléfono celular',
  phoneHint: '10 dígitos, para recordatorios de citas',
  invalidDate: 'Ingrese una fecha de nacimiento válida',
  invalidPhone: 'Ingrese un número de teléfono de 10 dígitos',

  householdSize: 'Personas en el hogar',
  householdHint: 'Cuéntese a usted, a su cónyuge o pareja y a quienes declara como dependientes.',
  fewerPeople: 'Menos personas',
  morePeople: 'Más personas',
  monthlyIncome: 'Ingreso mensual del hogar antes de impuestos (USD)',
  incomeHint: 'Escriba 0 si el hogar no tiene ingresos.',
  invalidIncome: 'Ingrese una cantidad en dólares',
  fplResult: (percent, year) => `${percent}% del Nivel Federal de Pobreza de ${year}`,
  tierName: (id) => (id === 'ineligible' ? 'Supera el límite de elegibilidad' : `Tarifa escalonada: nivel ${id}`),
  tierShort: (id) => (id === 'ineligible' ? 'No elegible' : `Nivel ${id}`),
  visitFee: (usd) => (usd === 0 ? 'Visitas sin costo' : `Costo por visita: $${usd}`),
  ineligibleNote:
    'El ingreso del hogar supera el límite de la clínica (200% del Nivel Federal de Pobreza). Ofrezca una referencia a un centro de salud comunitario.',
  fplNote: 'La elegibilidad se confirma con comprobantes de ingresos en la primera visita.',

  consentToTreatTitle: 'Consentimiento para recibir tratamiento',
  consentToTreatBody:
    'Acepto recibir atención médica de los voluntarios y el personal de Community Free Clinic, incluidos exámenes, pruebas y el tratamiento que mi proveedor recomiende. Entiendo que la atención la brindan voluntarios y que puedo rechazar cualquier tratamiento.',
  consentToTreatCheck: 'He leído y acepto',
  privacyTitle: 'Aviso de prácticas de privacidad',
  privacyBody:
    'Reconozco que recibí el Aviso de prácticas de privacidad de la clínica, que explica cómo se puede usar y compartir mi información de salud y cuáles son mis derechos sobre esa información.',
  privacyCheck: 'Confirmo que recibí el aviso',
  signHere: 'Firme aquí con el dedo',
  clear: 'Borrar',
  signed: (time) => `Firmado a las ${time}`,
  witnessedBy: (role) => `Testigo: voluntario de ${role}`,
  needsCheck: 'Marque la casilla para continuar',
  needsSignature: 'Se requiere la firma',

  reviewSummary: 'Resumen',
  household: 'Hogar',
  povertyLevel: 'Nivel Federal de Pobreza',
  slidingFee: 'Tarifa escalonada',
  people: (n) => (n === 1 ? '1 persona' : `${n} personas`),
  consents: 'Consentimientos',
  signedStatus: 'Firmado',
  jsonTitle: 'Recursos FHIR R4',
  jsonNote: 'Generado en este dispositivo. No se envía nada a ningún servidor.',
  jsonTruncated: 'Los datos de la imagen de la firma se acortan en pantalla; Copiar JSON los incluye completos.',
  copyJson: 'Copiar JSON',
  copied: 'Copiado al portapapeles',
  startOver: 'Iniciar un registro nuevo',

  roles: {
    frontDesk: 'recepción',
    nurse: 'enfermería',
    provider: 'proveedor médico',
    pharmacy: 'farmacia',
    student: 'estudiante de medicina',
  },
};

export const INTAKE_STRINGS: Record<IntakeLanguage, IntakeStrings> = { en, es };
