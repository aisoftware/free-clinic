import type { PatientVM } from '../lib/fhir/mappers';

export type PatientsStackParamList = {
  PatientList: undefined;
  PatientDetail: { patient: PatientVM };
};
