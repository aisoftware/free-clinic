// Generated synthetic data. Every person, identifier, and phone number here is fictional.
// Phone numbers use the 555-01xx range reserved for fiction.
import type { Coverage } from '../../lib/fhir/types';

export const sampleCoverage: Coverage[] = [
  {
    "resourceType": "Coverage",
    "id": "sample-004-cov-1",
    "status": "active",
    "beneficiary": {
      "reference": "Patient/sample-004"
    },
    "payor": [
      {
        "display": "Medicare Part D"
      }
    ]
  }
];
