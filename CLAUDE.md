# Free Clinic Companion: build rules

## Platform
- Must import into Expo Snack ("Import Git repository") and run with no edits.
- Expo SDK 56 (Snack has no SDK 57 yet). When Snack ships 57: `npx expo install expo@~57 --fix`, retest.
- Single Expo project at root, one package.json, `App.tsx` is the entry (`main: node_modules/expo/AppEntry.js`).
- No expo-router, no `app/` directory, no metro.config.js, no app.config.ts, no tsconfig path aliases (relative imports only).
- No binary files on `main` (images, fonts, SVG files): Snack's Git import fails uploading them. Screenshots go on the `screenshots` branch.
- Navigation: @react-navigation/native with stack (JS) and bottom-tabs. Not native-stack: Snack's package builder fails on react-native-screens 4.19+, so react-native-screens is not a dependency.
- Dependencies: Expo-maintained or Expo Go bundled only. No dev-build native modules. Add with `npx expo install`, then confirm Snack can build it: `https://snackager.eascdn.net/bundle/<name>@<version>?version_snackager=true&sdkVersion=56.0.0&platforms=ios,android,web` must return a `handle`.
- TypeScript strict. Zero errors: run `npx tsc --noEmit` before every report. No `any` anywhere; raw FHIR shapes live in `lib/fhir/types.ts`.

## Data
- FHIR source: https://r4.smarthealthit.org. Fallback: bundled sample data in `data/sample/` with a visible banner. No HAPI or other open community server (messy public uploads).
- Browser requests must stay CORS-simple: GET with only an `Accept` header. SMART returns 403 to OPTIONS preflights.
- All requests go through `lib/fhir/client.ts` `search<T>()`: 8 s timeout, one retry, then fallback. Returns `{ entries, total, source }`.
- Patient-scoped queries go to the server the patient came from (ids do not cross servers).
- Never rely on a single hardcoded patient id; always list patients.
- Nothing is written to any FHIR server. Intake, check-in, and PAP state are in-memory only.
- Screens never read raw FHIR; mappers in `lib/fhir/mappers.ts` produce view models.
- Synthetic data only. Persistent footer on every screen: "Synthetic data from a public FHIR sandbox. Not a medical record."

## Structure
- `screens/`, `components/`, `navigation/`, `lib/fhir/` (client, types, mappers), `lib/rules/` (PAP, FPL), `lib/roles.ts`, `state/`, `data/sample/`, `theme/`.
- Role gating only through `can(role, capability)` in `lib/roles.ts`. No scattered role conditionals.
- Theme tokens only from `theme/index.ts`. Light mode. 44pt minimum touch targets. Layouts must survive large Dynamic Type.
- Every network-backed screen: loading (skeleton), empty, error with retry, sample-data fallback.

## Style
- No emojis anywhere (UI, comments, docs).
- Comments explain healthcare decisions, not React mechanics.
- Claim discipline: FHIR R4 capability demo on synthetic data. Not a production EHR integration, not HIPAA-compliant on its own, no athenaOne or vendor connection.
- Prose files are only README.md, SNACK.md, CLAUDE.md. Marketing drafts go in `deliverables/` (gitignored).
- Commit to `main`, one commit per process step, no pull requests.
