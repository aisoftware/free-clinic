# Expo Snack: import, publish, and device checklist

## Import the repository

1. Push `main` to `https://github.com/aisoftware/free-clinic`. Snack only imports public repositories.
2. Open https://snack.expo.dev and sign in with the Expo account that should own the Snack.
3. In the left sidebar, open the **...** menu next to the file list and choose **Import git repository**.
4. Paste `https://github.com/aisoftware/free-clinic` as the repository URL. Select **Show advanced options**, leave **Folder path** empty, and set **Branch name** to `main`.
5. Select **Import repository** and wait for the redirect to the new Snack.
6. Confirm the SDK version selector at the bottom of the editor shows **56.0.0**. Snack reads it from `expo` in `package.json`. SDK 56 is hidden from Snack's picker while its support is in preview, so if a different SDK is selected, open the Snack URL with `?sdkVersion=56.0.0` appended and save again.
7. Confirm the **Web** preview loads the Today screen and that the Patients tab lists patients without the "Sandbox unavailable" banner.
8. Open the project settings (the Snack name at the top of the editor) and set the title and description below. Save.
9. Copy the Snack URL into the README (top of the file) and into the LinkedIn first comment.

Snack imports every file in the repository, so `README.md`, `SNACK.md`, and `CLAUDE.md` appear in the Snack's file list. They do not affect the app.

### Keep image files off `main`

Snack's importer uploads every file that is not `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, or `.md` as an asset. On 2026-09-15 that upload fails for every repository, including Snack's own example, with:

```
Failed to create snack: Error generating snackObj: Error parsing files: Failed to upload file asset ({"errors":[{"code":"VALIDATION_ERROR", ... "message":"\"$\": Required." ...
```

So `main` has no PNG, SVG, font, or other binary files: the Expo template icons were removed from `assets/` and `app.json`, and README screenshots live on the `screenshots` branch. If you see this error again, run `git ls-files | grep -vE '\.(tsx?|jsx?|json|md)$'` and move anything listed (other than dotfiles) off `main`. Once Snack fixes asset uploads, app icons can come back.

### Dependencies Snack cannot build

Snack builds each dependency that is not preloaded with its own package service. That service currently fails on `react-native-screens` 4.19 and later, which is why the app uses the JavaScript stack navigator and does not depend on `react-native-screens`. If Snack shows "Failed to resolve dependency" after an upgrade, check the package with:

```
https://snackager.eascdn.net/bundle/<name>@<version>?version_snackager=true&sdkVersion=56.0.0&platforms=ios,android,web
```

A response with a `handle` field is built; `"pending": true` means try again in a minute; "Module build failed" means Snack cannot load that version.

### Snack title

```
Free Clinic Companion — FHIR R4 demo (Expo, TypeScript)
```

### Snack description

```
Volunteer-facing app for free and charitable clinics, built against FHIR R4. Role-based access with visible minimum-necessary locks, patient charts from the SMART Health IT sandbox, bilingual intake with signed consent rendered as FHIR Patient and Consent resources, and a patient assistance program queue. Synthetic data only; not a medical record, not an EHR integration, not HIPAA-compliant on its own. Source: github.com/aisoftware/free-clinic
```

## Running on a phone

The App Store and Play Store versions of Expo Go are 57.0.9 and run SDK 57 projects only. This Snack is SDK 56 because Snack does not support SDK 57 yet, so the store app will refuse to open it. Options until Snack ships SDK 57:

- **Android:** install the SDK 56 Expo Go client (`Expo-Go-56.0.4.apk` from https://github.com/expo/expo-go-releases/releases/tag/Expo-Go-56.0.4), then scan the Snack QR code.
- **iOS device:** Expo Go for older SDKs is not distributed through the App Store. Check whether your EAS CLI can build an SDK 56 client with `eas go` (Apple Developer account and TestFlight required). If it cannot, run the checklist on the iOS Simulator (`npx expo start`, then press `i`, which installs the matching Expo Go), and note simulator results as such.
- **Any phone browser:** the Snack web preview runs in mobile Safari and Chrome. It covers layout and data, not native gestures or keyboard behavior.

When Snack supports SDK 57, upgrade with the steps in the README and use the store Expo Go.

## Device checklist

Run on one iOS and one Android device in Expo Go. For each failure, send back the device, OS version, screen, the step number, and what happened (a screen recording helps for gestures).

| # | Area | Steps | Expected | iOS | Android |
| --- | --- | --- | --- | --- | --- |
| 1 | Cold start | Open the Snack fresh. | Today screen within about 3 seconds; no red error screen. | | |
| 2 | Safe areas | On Today (no header), check the clinic name against the notch or status bar and the tab bar against the home indicator. Rotate is not supported; stay portrait. | Nothing clipped or under the status bar; footer notice and tab labels fully visible. | | |
| 3 | Banner safe area | About: turn on "Use bundled sample data only", then open Today. | The sample-data banner sits below the status bar, not under it. Turn the switch off afterward. | | |
| 4 | Pull to refresh | Patients: pull down. Open a chart, Vitals tab: pull down. PAP Queue (Pharmacy): pull down. | Native spinner appears and the list reloads each time. | | |
| 5 | Offline fallback | Airplane mode on, Patients: pull down. | After a short wait, sample patients appear with "Sandbox unavailable, showing sample data". Airplane mode off, pull down again: live patients return and the banner clears. | | |
| 6 | Chart error | With live patients listed, airplane mode on, open a chart and select Encounters. | Error message with Try again; Try again succeeds after airplane mode is off. | | |
| 7 | Signature: drawing | Intake as Front Desk: complete steps 1 and 2, then draw a signature in the first pad with a finger, including a stroke that starts on the "Sign here" text. | The line follows the finger closely with no offset; the stroke starting on the text also draws. | | |
| 8 | Signature: scroll lock | Draw a long vertical stroke inside a pad. | The page does not scroll while drawing; after lifting the finger, the page scrolls normally. | | |
| 9 | Signature: clear and second pad | Tap Clear, sign again, then sign the second pad. | Clear empties only that pad; "Signed at" time and witness line appear under each. | | |
| 10 | Keyboard: step 1 | Intake step 1: tap each field in order (first name through phone). | The focused field and its label stay visible above the keyboard; month, day, year, and phone show number pads; filling month and day moves focus forward. | | |
| 11 | Keyboard: step 2 | Intake step 2: tap the income field. | Field and FPL result card remain reachable by scrolling with the keyboard open; decimal keypad shown. | | |
| 12 | Keyboard: PAP notes | PAP Queue as Pharmacy: tap a notes field near the bottom of the screen. | The notes field scrolls above the keyboard. | | |
| 13 | Spanish | Intake: select Español and walk all four steps, including a validation error. | Every label, hint, error, consent text, and the header title are in Spanish; the tab label stays "Intake". | | |
| 14 | Copy JSON | Finish an intake, tap Copy JSON, paste into Notes or a message. | Full JSON pastes, including long signature data; button shows the copied confirmation. | | |
| 15 | Role gating | Today: switch through all five roles; for each, open a patient chart and the PAP Queue. | Front Desk sees Summary only; Medical Student sees Summary, Conditions, Vitals with check-in locked; Pharmacy sees PAP updates; each hidden item shows a lock and reason. | | |
| 16 | Role picker sheet | From any Patients header, tap the role button. | Bottom sheet opens above the home indicator; tapping outside closes it. | | |
| 17 | Dynamic Type | Set text size to the largest accessibility size, reopen the Snack, visit Today, a chart's Summary and Vitals, Intake step 3, and PAP Queue. | Text wraps rather than truncating important content; no overlapping elements; buttons remain tappable. Note any clipped PAP stepper labels. | | |
| 18 | Android back | Open a chart, press the system back button or gesture. | Returns to the patient list without leaving the app. | | |
| 19 | Links | About: tap the LinkedIn and GitHub links. | Each opens in the browser. | | |
