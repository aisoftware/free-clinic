import type { NavigatorScreenParams } from '@react-navigation/native';

import type { PatientVM } from '../lib/fhir/mappers';

export type PatientsStackParamList = {
  PatientList: undefined;
  PatientDetail: { patient: PatientVM };
};

export type RootTabParamList = {
  TodayTab: undefined;
  PatientsTab: NavigatorScreenParams<PatientsStackParamList> | undefined;
  IntakeTab: undefined;
  PapTab: undefined;
  AboutTab: undefined;
};
