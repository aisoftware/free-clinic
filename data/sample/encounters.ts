// Generated synthetic data. Every person, identifier, and phone number here is fictional.
// Phone numbers use the 555-01xx range reserved for fiction.
import type { Encounter } from '../../lib/fhir/types';

export const sampleEncounters: Encounter[] = [
  {
    "resourceType": "Encounter",
    "id": "sample-001-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-001"
    },
    "period": {
      "start": "2025-11-04T09:15:00-05:00",
      "end": "2025-11-04T10:15:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-001-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-001"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-001-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-001"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-001-enc-4",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-001"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "44054006",
            "display": "Diabetes mellitus type 2"
          }
        ],
        "text": "Diabetes mellitus type 2"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-002-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-002"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-002-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-002"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-002-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-002"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "49436004",
            "display": "Atrial fibrillation"
          }
        ],
        "text": "Atrial fibrillation"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-003-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-003"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-003-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-003"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-003-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-003"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "195967001",
            "display": "Asthma"
          }
        ],
        "text": "Asthma"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-004-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-004"
    },
    "period": {
      "start": "2025-11-04T09:15:00-05:00",
      "end": "2025-11-04T10:15:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-004-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-004"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-004-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-004"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-004-enc-4",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-004"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "13645005",
            "display": "Chronic obstructive lung disease"
          }
        ],
        "text": "Chronic obstructive lung disease"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-005-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-005"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-005-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-005"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-005-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-005"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "40930008",
            "display": "Hypothyroidism"
          }
        ],
        "text": "Hypothyroidism"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-006-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-006"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-006-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-006"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-006-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-006"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "44054006",
            "display": "Diabetes mellitus type 2"
          }
        ],
        "text": "Diabetes mellitus type 2"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-007-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-007"
    },
    "period": {
      "start": "2025-11-04T09:15:00-05:00",
      "end": "2025-11-04T10:15:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-007-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-007"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-007-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-007"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-007-enc-4",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-007"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "22298006",
            "display": "Myocardial infarction"
          }
        ],
        "text": "Myocardial infarction"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-008-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-008"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-008-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-008"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "197480006",
            "display": "Anxiety disorder"
          }
        ],
        "text": "Anxiety disorder"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-009-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-009"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-009-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-009"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-009-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-009"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "271737000",
            "display": "Anemia"
          }
        ],
        "text": "Anemia"
      }
    ]
  },
  {
    "resourceType": "Encounter",
    "id": "sample-010-enc-1",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "185349003",
            "display": "Encounter for check up"
          }
        ],
        "text": "Encounter for check up"
      }
    ],
    "subject": {
      "reference": "Patient/sample-010"
    },
    "period": {
      "start": "2025-11-04T09:15:00-05:00",
      "end": "2025-11-04T10:15:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-010-enc-2",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-010"
    },
    "period": {
      "start": "2026-02-10T10:30:00-05:00",
      "end": "2026-02-10T11:30:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-010-enc-3",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-010"
    },
    "period": {
      "start": "2026-05-12T14:00:00-05:00",
      "end": "2026-05-12T15:00:00-05:00"
    }
  },
  {
    "resourceType": "Encounter",
    "id": "sample-010-enc-4",
    "status": "finished",
    "class": {
      "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      "code": "AMB",
      "display": "ambulatory"
    },
    "type": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "390906007",
            "display": "Follow-up encounter"
          }
        ],
        "text": "Follow-up encounter"
      }
    ],
    "subject": {
      "reference": "Patient/sample-010"
    },
    "period": {
      "start": "2026-08-18T09:45:00-05:00",
      "end": "2026-08-18T10:45:00-05:00"
    },
    "reasonCode": [
      {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "44054006",
            "display": "Diabetes mellitus type 2"
          }
        ],
        "text": "Diabetes mellitus type 2"
      }
    ]
  }
];
