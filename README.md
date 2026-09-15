# Free Clinic Companion

A volunteer-facing mobile app for free and charitable clinics, built with Expo and TypeScript against FHIR R4. It runs in Expo Snack with no changes and talks directly to the SMART Health IT FHIR sandbox, with bundled synthetic data as a fallback.

> Synthetic data from public FHIR sandboxes. Not a medical record.

| Patients (live SMART sandbox) | Patient chart, Vitals (live SMART sandbox) | PAP Queue (bundled sample data) |
| --- | --- | --- |
| ![Patients list](https://raw.githubusercontent.com/aisoftware/free-clinic/screenshots/patients.png) | ![Patient detail vitals tab](https://raw.githubusercontent.com/aisoftware/free-clinic/screenshots/patient-vitals.png) | ![PAP queue](https://raw.githubusercontent.com/aisoftware/free-clinic/screenshots/pap-queue.png) |

Screenshots are from the web preview at a 390x844 viewport (2x), captured with Playwright against `npx expo start --web`. Device screenshots will replace them. The images live on the `screenshots` branch, because Snack's Git import currently fails on any repository that contains image files (see SNACK.md). The PAP Queue capture uses bundled sample data because the live sandbox currently yields a single candidate (see [Data notes](#data-notes)).

## Who this is for

1. **Engineers and hiring managers evaluating React Native work in healthcare.** Open the Snack on a phone, switch roles on the Today screen, open a patient chart, and read `lib/fhir/client.ts` and `lib/roles.ts`. The code should hold up to that two-minute look.
2. **Free clinic directors and volunteer coordinators.** The screens follow a clinic day: front desk check-in, bilingual intake with consent, nurse and provider chart review, and the pharmacy's patient assistance program (PAP) applications, with the dollar value those applications represent.

The workflows come from volunteer CTO work at Health and Hope Clinic in Pensacola. No clinic data, names, or identifiers are used anywhere.

## What this is, and what it is not

- This demonstrates **FHIR R4 standards capability on synthetic data**.
- It is **not a production EHR integration**.
- It is **not HIPAA-compliant on its own**: there is no authentication, audit log, encrypted storage, or BAA-covered hosting.
- It does **not connect to athenaOne or any other vendor system**.
- Nothing is written to any FHIR server. Check-ins, intake, and PAP progress live in memory and are gone when the app closes.

## Screens

| Screen | What it shows |
| --- | --- |
| **Today** | Clinic name, date, and the volunteer role selector (Front Desk, Nurse, Provider, Pharmacy, Medical Student). Checked in, waiting, in room, and completed counts from local check-in state. Quick actions filtered by role. A waiting and in-room list that opens charts. |
| **Patients** | `Patient?_count=20&_sort=family` with name search, age, sex, MRN, check-in chip, pull to refresh, skeleton, empty, and error states. |
| **Patient chart** | Summary (demographics, preferred language, phone, check-in status), Conditions, Medications with PAP tags, Vitals (latest per LOINC code with blood pressure components, sparkline and trend at three or more readings), Encounters. Tabs a role may not see show a lock and a one-line reason, and never request their data. |
| **Intake** | Four steps: demographics; household size and income with 2026 FPL percentage and sliding-fee tier; consent to treat and Notice of Privacy Practices acknowledgment with signature pads, signing time, and witnessing role; review as a FHIR `Patient` plus two `Consent` resources with Copy JSON. The English/Spanish toggle covers the whole flow. |
| **PAP Queue** | Every PAP-eligible `MedicationRequest` across loaded patients, a status stepper (Identified, Application sent, Approved, Shipped, Dispensed), estimated retail value, notes, and "Estimated medication value in queue". |
| **About** | Claim discipline, the FHIR queries, an architecture note, the role access matrix generated from code, a sample-data switch, and links. |

## Run it

**In Expo Snack:** follow [SNACK.md](SNACK.md).

**Locally:**

```bash
npm install
npx expo start --web     # web preview
npx expo start           # Expo Go on a device or simulator (SDK 56 client required)
npx tsc --noEmit         # type check
```

Node 22 was used for development.

## FHIR queries

All requests are read-only `GET` searches with only an `Accept: application/fhir+json` header, so a browser never sends a CORS preflight.

```
GET {base}/Patient?_count=20&_sort=family
GET {base}/Patient?name={text}&_count=20&_sort=family
GET {base}/Condition?patient={id}
GET {base}/MedicationRequest?patient={id}
GET {base}/Coverage?patient={id}
GET {base}/Observation?patient={id}&category=vital-signs&_sort=-date&_count=20
GET {base}/Encounter?patient={id}&_sort=-date
```

`{base}` is `https://r4.smarthealthit.org`. If it cannot be reached, the app uses bundled sample data with a visible "Sandbox unavailable, showing sample data" banner.

## Architecture

```
App.tsx                 entry (Snack and local)
navigation/             tab and stack navigators on React Navigation's routers, header, route types
screens/                Today, Patients, PatientDetail (+ patient/ tabs), Intake (+ intake/ steps), PapQueue, About
components/             Screen wrapper (banner and footer), state views, form controls, signature pad, sparkline
lib/fhir/client.ts      search<K>(resourceType, params, options) -> { entries, total, source }
lib/fhir/types.ts       hand-written R4 types for the seven resources used
lib/fhir/mappers.ts     raw resources -> view models; screens never read raw FHIR
lib/fhir/queries.ts     patient-scoped reads and the PAP screening pass
lib/fhir/intake.ts      intake -> Patient and Consent resources
lib/rules/pap.ts        PAP eligibility heuristic and illustrative drug list
lib/rules/fpl.ts        2026 HHS poverty guideline and sliding-fee tiers
lib/roles.ts            can(role, capability) table
lib/i18n/intake.ts      English and Spanish intake strings
state/                  in-memory app state and the query hook
data/sample/            synthetic fallback data and an in-memory search
theme/                  color, spacing, type scale, touch target
```

There are no image files on `main`: the app uses vector icons, and the Expo template icons were removed so Snack's import has nothing to upload as an asset.

- **Data layer.** One client runs every search with an 8 second timeout and one retry against SMART, then falls back to bundled sample data. After a failure, SMART is skipped for a minute so screens do not wait through the same timeouts again; pull to refresh retries it.
- **Source pinning.** Resource ids only mean something on the server that issued them, so chart queries go to the server the patient came from. If that server fails, the chart shows an error with retry instead of quietly substituting another record.
- **Role gating.** A single `can(role, capability)` table in `lib/roles.ts`. Locked chart tabs never mount, the PAP queue never searches for roles without access, and the About screen renders the same table.
- **Error handling.** Every network-backed screen has skeleton loading, empty, error with retry, and sample-data fallback states, so the demo never shows a blank screen or an unhandled error.

## Verification log

Checked on 2026-09-15.

**Expo SDK and Snack**

| Check | Result |
| --- | --- |
| Latest Expo SDK (`exp.host/--/api/v2/versions`) | SDK 57.0.0 (React Native 0.86.3), released 2026-06-30 |
| Snack SDK support (snack.expo.dev bundle and `expo/snack` source) | SDKs 50 to 56. SDK 56 is present but hidden from the picker and pinned to `56.0.0-preview.7`. SDK 57 is an open pull request (expo/snack#691). Default SDK is 54. |
| Snack Git import | Infers the SDK from the `expo` version in `package.json` and reads only `dependencies`. Every non-code file is uploaded as an asset, and on 2026-09-15 that upload fails for all repositories (reproduced with Snack's own example repository), so `main` carries no image files. |
| Expo Go in the App Store and Play Store | 57.0.9, which runs SDK 57 projects only |

**Decision: built on SDK 56**, per the fallback rule. The Snack web preview works on SDK 56 today. Phones need an SDK 56 Expo Go client until Snack supports 57 (details in SNACK.md). When Snack ships SDK 57:

```bash
npx expo install expo@~57.0.0 --fix
npx tsc --noEmit
```

Then update the SDK line in `CLAUDE.md` and this section, and re-run the SNACK.md checklist.

**FHIR sandboxes**

| Check | SMART Health IT (`r4.smarthealthit.org`) | HAPI (`hapi.fhir.org/baseR4`) |
| --- | --- | --- |
| `GET /metadata` | 200 in 0.40 s, FHIR 4.0.0, Smile CDR 2019.08 | 200 in 1.45 s, FHIR 4.0.1, HAPI FHIR 8.11.16 |
| `Patient?_count=20&_sort=family` | 200, 20 entries | 200, 20 entries |
| CORS | Reflects the request `Origin` | `Access-Control-Allow-Origin: *` |
| Preflight `OPTIONS` | 403, so requests must stay CORS-simple | not needed |
| Patient-scoped searches used by the app | all 200 | not exercised (fallback only) |

SMART is the primary source. HAPI was the brief's second fallback, but it was removed on 2026-09-15 (see Decisions).

**Dependencies** (all installed with `npx expo install` for SDK 56)

| Package | Why | Snack handling |
| --- | --- | --- |
| `expo`, `react`, `react-native`, `react-native-web`, `react-dom` | runtime | core modules |
| `react-native-safe-area-context`, `@expo/vector-icons` | safe areas, icons | bundled in Snack |
| `@react-navigation/native` | navigation container, routers, and navigator builder | built by Snack's package service |
| `react-native-svg` | sparklines and signature pad | built by Snack's package service; native code included in Expo Go |
| `expo-clipboard`, `expo-status-bar` | Copy JSON, status bar | Expo modules included in Expo Go |

One substitution: the published `@react-navigation/bottom-tabs`, `stack`, and `native-stack` packages were replaced by a small tab navigator and stack navigator in `navigation/navigators.tsx`, built on `@react-navigation/native`'s own `TabRouter`, `StackRouter`, and `useNavigationBuilder`. Snack's package service fails to build `react-native-screens` 4.19 through 4.26 (a codegen error in its native component specs). `native-stack` requires it outright, and `bottom-tabs` and `stack` declare it as a peer dependency, which puts a red "requires peer-dependency" bar with an "Add dependency" button on every Snack load; selecting it breaks the Snack. The in-house navigators keep React Navigation's state, actions, nested navigation, and Android back handling, and every remaining dependency was confirmed to build on Snack for SDK 56. `expo-router` was not used, as required. No FHIR typings package was added; the hand-written types cover the seven resources used.

**Quality checks**

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors, strict mode, no `any` |
| Emoji scan of tracked files | none |
| Web preview at 390 px | all screens reviewed; no console errors |
| Production web bundle (`npx expo export --platform web`) | 1.6 MB JavaScript |
| Cold start to interactive Today screen, empty cache (median of 3) | 88 ms local; 1.8 s with 4G emulation (9 Mbps, 85 ms RTT, uncompressed) and 4x CPU slowdown |
| Cold start to live patient rows rendered, same conditions | 0.3 s local; 2.1 s with 4G emulation and 4x CPU slowdown |
| Offline fallback | FHIR host blocked in the browser: SMART tried twice, then sample data with the banner |

Native-only behavior (gestures, keyboard, Dynamic Type, safe areas) is covered by the device checklist in SNACK.md.

## Decisions

Choices made during the build, noted here as the brief asked.

- **SDK 56** instead of 57, because Snack does not support 57 yet (see the verification log).
- **No HAPI fallback.** The brief called for SMART, then the HAPI public server, then sample data. During a SMART outage on 2026-09-15 the app fell back to HAPI as designed and showed unnamed patients, patients with no identifiers, and placeholder names, because HAPI's public server holds uploads from anyone. SMART now falls back directly to the bundled sample data, which is clean and clearly labeled.
- **Default role is Nurse**, which sees the full chart, so a first look shows the most. Role changes apply everywhere immediately.
- **Locked tabs stay visible** with a lock icon and a one-line reason instead of disappearing, so "minimum necessary" is visible rather than implied.
- **Only the MRN is shown.** SMART records also carry SSN, driver license, and passport identifiers; the mapper never reads them. Sandbox MRNs are UUIDs, so the list shows the first eight characters and the chart shows the full value.
- **Deceased patients** are flagged in the list and chart, their age stops at the date of death, and the simulated shift never places them in the waiting room.
- **Simulate a morning shift** on the Today screen checks in seven loaded patients so the counts and waiting list have data on first open. It is local state like any other check-in.
- **Sample-data switch** on the About screen shows the offline experience without disabling the network. Charts opened from a sandbox keep their source.
- **PAP rule** requires a listed brand, an active order, and no Coverage resource on file. The fourteen brands are illustrative, chosen from programs commonly used by free clinics, and include Mirena, Kyleena, and NuvaRing because they appear in the SMART data. Estimated retail values are round illustrative numbers, not pricing data.
- **Pharmacy sees Conditions** in addition to Medications, because manufacturer PAP applications require a diagnosis. Provider can view the PAP queue; only Pharmacy can update it.
- **FPL table is the 2026 HHS guideline** for the 48 contiguous states and DC, bundled as a constant. The sliding-fee tiers and the 200% FPL eligibility limit are illustrative; each clinic's board sets its own.
- **Intake date of birth uses separate month, day, and year fields** to avoid MM/DD versus DD/MM confusion between English and Spanish.
- **Household income is not placed in the FHIR output.** The Patient resource carries household size, FPL percentage, and fee tier as example extensions; the raw income figure stays out.
- **Consent resources** use `consentscope` codes `treatment` and `patient-privacy`, LOINC categories 59284-0 and 57016-8, a clinic policy URI for consent to treat, the `hipaa-npp` policy rule for the privacy acknowledgment, the witness as a `verification` entry recorded by role, and the signature as a base64 SVG `sourceAttachment`. FHIR output stays in English regardless of the form language.
- **Spanish covers the Intake flow**, including validation messages and the screen title. Other screens are English, as the brief allows.

## Data notes

- SMART's synthetic records were generated by Synthea around 2019 to 2021, so visit dates are years old, and four of the first twenty patients are deceased in the record.
- Among those twenty patients, heart rate and SpO2 do not appear in the most recent twenty vital-sign observations, so those cards read "Not recorded".
- None of those patients has a Coverage resource, and only one has an active PAP-listed medication (Kyleena), so the live PAP queue shows one item worth an estimated $1,100. The bundled sample data yields nine items worth $4,600, with one patient excluded by Medicare coverage.
- On 2026-09-15 the SMART sandbox returned HTTP 502 for every request for a period, so the sample-data fallback is not hypothetical.

## What I would do next for a real clinic deployment

- **Authentication and authorization.** SMART Backend Services (client credentials with signed JWT assertions) for a clinic backend talking to the EHR, and SMART App Launch with the clinic's identity provider for volunteers, mapping real roles and scopes to the `can()` table instead of a role picker.
- **Write-back.** Check-ins as `Encounter` or `Appointment` updates, intake as a FHIR transaction with conditional create to prevent duplicate patients, and consents stored with the signed document, all sent through the backend rather than directly from the device.
- **Offline queue.** Encrypted local storage for pending writes, retry with idempotency keys, and conflict handling for a clinic with unreliable Wi-Fi, with a short retention window and remote wipe for lost devices.
- **Audit log.** `AuditEvent` and `Provenance` for every read and write of patient data, tied to the authenticated volunteer, with a report the clinic's privacy officer can review.
- **BAA-covered hosting.** The backend, logs, and any stored data on infrastructure covered by a business associate agreement, with no patient data in analytics, crash reports, or push notification payloads.
- Program-specific PAP rules with income documentation, a full Spanish translation, and accessibility testing with VoiceOver and TalkBack.

## Author

Larry Brooks, Applied Intelligence Software. [LinkedIn](https://www.linkedin.com/in/aisoftware)
