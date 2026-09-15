import * as Clipboard from 'expo-clipboard';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../components/Button';
import { Card, FieldRow, SectionTitle } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Checkbox, NumberStepper, TextField } from '../../components/FormControls';
import { SignaturePad } from '../../components/SignaturePad';
import { buildIntakeBundle } from '../../lib/fhir/intake';
import { IntakeLanguage, IntakeStrings, LANGUAGE_NAMES } from '../../lib/i18n/intake';
import { feeTierFor, FPL_2026, fplPercent } from '../../lib/rules/fpl';
import type { Role } from '../../lib/roles';
import { colors, radius, spacing, touchTarget, type } from '../../theme';
import { birthDateOf, ConsentDraft, digitsOnly, Errors, IntakeForm, incomeOf } from './form';

interface StepProps {
  form: IntakeForm;
  update: (change: Partial<IntakeForm>) => void;
  errors: Errors;
  t: IntakeStrings;
}

// ---- Step 1: demographics --------------------------------------------------------------------

export function DemographicsStep({ form, update, errors, t }: StepProps) {
  const familyRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  return (
    <View style={styles.stack}>
      <View style={styles.field}>
        <Text style={styles.label}>{t.preferredLanguage}</Text>
        <View style={styles.toggle} accessibilityRole="radiogroup">
          {(Object.keys(LANGUAGE_NAMES) as IntakeLanguage[]).map((lang) => {
            const selected = form.language === lang;
            return (
              <Button
                key={lang}
                label={LANGUAGE_NAMES[lang]}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => update({ language: lang })}
                style={styles.toggleButton}
              />
            );
          })}
        </View>
      </View>

      <TextField
        label={t.givenName}
        value={form.givenName}
        onChangeText={(givenName) => update({ givenName })}
        error={errors.givenName}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={() => familyRef.current?.focus()}
      />
      <TextField
        ref={familyRef}
        label={t.familyName}
        value={form.familyName}
        onChangeText={(familyName) => update({ familyName })}
        error={errors.familyName}
        autoCapitalize="words"
        autoComplete="family-name"
        textContentType="familyName"
        returnKeyType="next"
        onSubmitEditing={() => monthRef.current?.focus()}
      />

      <View style={styles.field}>
        <Text style={styles.label}>{t.dateOfBirth}</Text>
        {/* Separate fields avoid the MM/DD versus DD/MM ambiguity between English and Spanish. */}
        <View style={styles.dateRow}>
          <View style={styles.dateSmall}>
            <TextField
              ref={monthRef}
              label={t.month}
              value={form.month}
              onChangeText={(v) => {
                update({ month: digitsOnly(v).slice(0, 2) });
                if (digitsOnly(v).length === 2) dayRef.current?.focus();
              }}
              keyboardType="number-pad"
              placeholder="MM"
              maxLength={2}
            />
          </View>
          <View style={styles.dateSmall}>
            <TextField
              ref={dayRef}
              label={t.day}
              value={form.day}
              onChangeText={(v) => {
                update({ day: digitsOnly(v).slice(0, 2) });
                if (digitsOnly(v).length === 2) yearRef.current?.focus();
              }}
              keyboardType="number-pad"
              placeholder="DD"
              maxLength={2}
            />
          </View>
          <View style={styles.dateLarge}>
            <TextField
              ref={yearRef}
              label={t.year}
              value={form.year}
              onChangeText={(v) => {
                update({ year: digitsOnly(v).slice(0, 4) });
                if (digitsOnly(v).length === 4) phoneRef.current?.focus();
              }}
              keyboardType="number-pad"
              placeholder={form.language === 'es' ? 'AAAA' : 'YYYY'}
              maxLength={4}
            />
          </View>
        </View>
        {errors.birthDate ? <Text style={styles.error}>{errors.birthDate}</Text> : null}
      </View>

      <TextField
        ref={phoneRef}
        label={t.phone}
        hint={t.phoneHint}
        value={form.phone}
        onChangeText={(phone) => update({ phone })}
        error={errors.phone}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        placeholder="555-555-0100"
      />
    </View>
  );
}

// ---- Step 2: household and sliding fee ------------------------------------------------------

export function HouseholdStep({ form, update, errors, t }: StepProps) {
  const income = incomeOf(form.monthlyIncome);
  const percent = income === null ? null : fplPercent(income, form.householdSize);
  const tier = percent === null ? null : feeTierFor(percent);

  return (
    <View style={styles.stack}>
      <NumberStepper
        label={t.householdSize}
        hint={t.householdHint}
        value={form.householdSize}
        min={1}
        max={15}
        onChange={(householdSize) => update({ householdSize })}
        decrementLabel={t.fewerPeople}
        incrementLabel={t.morePeople}
      />
      <TextField
        label={t.monthlyIncome}
        hint={t.incomeHint}
        value={form.monthlyIncome}
        onChangeText={(monthlyIncome) => update({ monthlyIncome })}
        error={errors.monthlyIncome}
        keyboardType="decimal-pad"
        placeholder="0"
      />
      {percent !== null && tier ? (
        <Card style={styles.result}>
          <Text style={styles.resultPercent} accessibilityLiveRegion="polite">
            {t.fplResult(percent, FPL_2026.year)}
          </Text>
          <View style={styles.chipRow}>
            <Chip label={t.tierName(tier.id)} tone={tier.id === 'ineligible' ? 'danger' : 'success'} />
          </View>
          <Text style={styles.body}>{tier.visitFeeUsd === null ? t.ineligibleNote : t.visitFee(tier.visitFeeUsd)}</Text>
          <Text style={styles.caption}>{t.fplNote}</Text>
        </Card>
      ) : null}
    </View>
  );
}

// ---- Step 3: consents with signatures -------------------------------------------------------

interface ConsentStepProps extends StepProps {
  role: Role;
  onSigningChange: (signing: boolean) => void;
}

export function ConsentStep({ form, update, errors, t, role, onSigningChange }: ConsentStepProps) {
  const section = (key: 'treatment' | 'privacy') => {
    const draft = form[key];
    const set = (change: Partial<ConsentDraft>) => update({ [key]: { ...draft, ...change } } as Partial<IntakeForm>);
    const title = key === 'treatment' ? t.consentToTreatTitle : t.privacyTitle;
    return (
      <Card key={key} style={styles.stack}>
        <Text style={styles.consentTitle} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.body}>{key === 'treatment' ? t.consentToTreatBody : t.privacyBody}</Text>
        <Checkbox
          label={key === 'treatment' ? t.consentToTreatCheck : t.privacyCheck}
          checked={draft.agreed}
          onChange={(agreed) => set({ agreed })}
          error={errors[`${key}Agreed`]}
        />
        <SignaturePad
          strokes={draft.strokes}
          onChange={(strokes, size) =>
            set({
              strokes,
              width: size.width,
              height: size.height,
              // The signature time and witness are captured when the patient signs, not at submit.
              signedAt: strokes.length ? new Date().toISOString() : null,
              witnessRole: strokes.length ? role : null,
            })
          }
          onSigningChange={onSigningChange}
          placeholder={t.signHere}
          clearLabel={t.clear}
          accessibilityLabel={`${title}: ${t.signHere}`}
        />
        {errors[`${key}Signature`] ? <Text style={styles.error}>{errors[`${key}Signature`]}</Text> : null}
        {draft.signedAt && draft.witnessRole ? (
          <View>
            <Text style={styles.caption}>{t.signed(formatTime(draft.signedAt, form.language))}</Text>
            <Text style={styles.caption}>{t.witnessedBy(t.roles[draft.witnessRole])}</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={styles.stack}>
      {section('treatment')}
      {section('privacy')}
    </View>
  );
}

function formatBirthDate(iso: string | null, lang: IntakeLanguage) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatPhone(value: string) {
  const d = digitsOnly(value);
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d;
}

function formatTime(iso: string, lang: IntakeLanguage) {
  return new Date(iso).toLocaleTimeString(lang === 'es' ? 'es-US' : 'en-US', { hour: 'numeric', minute: '2-digit' });
}

// ---- Step 4: review and FHIR output ---------------------------------------------------------

const ROLE_LABELS_EN: Record<Role, string> = {
  frontDesk: 'Front Desk',
  nurse: 'Nurse',
  provider: 'Provider',
  pharmacy: 'Pharmacy',
  student: 'Medical Student',
};

export function ReviewStep({ form, t, onStartOver }: StepProps & { onStartOver: () => void }) {
  const [copied, setCopied] = useState(false);
  const income = incomeOf(form.monthlyIncome) ?? 0;
  const percent = fplPercent(income, form.householdSize);
  const tier = feeTierFor(percent);

  const json = useMemo(() => {
    const birthDate = birthDateOf(form) ?? '';
    const signed = (d: ConsentDraft) => ({
      strokes: d.strokes,
      width: d.width,
      height: d.height,
      signedAt: d.signedAt ?? new Date().toISOString(),
      witnessRole: d.witnessRole ?? 'frontDesk',
      // FHIR content stays in English regardless of the form language.
      witnessLabel: ROLE_LABELS_EN[d.witnessRole ?? 'frontDesk'],
    });
    const bundle = buildIntakeBundle(
      { givenName: form.givenName, familyName: form.familyName, birthDate, phoneDigits: digitsOnly(form.phone), language: form.language },
      { size: form.householdSize, monthlyIncome: income, fplPercent: percent, fplYear: FPL_2026.year, tier },
      { treatment: signed(form.treatment), privacy: signed(form.privacy) },
    );
    const full = JSON.stringify(bundle, null, 2);
    const display = JSON.stringify(bundle, (k, v) => (k === 'data' && typeof v === 'string' && v.length > 60 ? `${v.slice(0, 60)}...` : v), 2);
    return { full, display };
  }, [form, income, percent, tier]);

  const copy = async () => {
    await Clipboard.setStringAsync(json.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <View style={styles.stack}>
      <SectionTitle>{t.reviewSummary}</SectionTitle>
      <Card>
        <FieldRow label={t.givenName} value={form.givenName.trim()} />
        <FieldRow label={t.familyName} value={form.familyName.trim()} />
        <FieldRow label={t.dateOfBirth} value={formatBirthDate(birthDateOf(form), form.language)} />
        <FieldRow label={t.phone} value={formatPhone(form.phone)} />
        <FieldRow label={t.preferredLanguage} value={LANGUAGE_NAMES[form.language]} />
        <FieldRow label={t.household} value={t.people(form.householdSize)} />
        <FieldRow label={t.povertyLevel} value={`${percent}% (${FPL_2026.year})`} />
        <FieldRow label={t.slidingFee} value={t.tierShort(tier.id)} />
        <FieldRow label={t.consents} value={<Chip label={`${t.signedStatus} (2)`} tone="success" />} last />
      </Card>

      <SectionTitle>{t.jsonTitle}</SectionTitle>
      <Text style={styles.caption}>{t.jsonNote}</Text>
      <View style={styles.jsonBox}>
        <ScrollView horizontal nestedScrollEnabled>
          <Text style={styles.json} selectable>
            {json.display}
          </Text>
        </ScrollView>
      </View>
      <Text style={styles.caption}>{t.jsonTruncated}</Text>
      <Button label={copied ? t.copied : t.copyJson} icon={copied ? 'checkmark' : 'copy-outline'} onPress={copy} />
      <Button label={t.startOver} variant="secondary" icon="refresh" onPress={onStartOver} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  field: { gap: spacing.xs },
  label: { ...type.bodyStrong, color: colors.text },
  toggle: { flexDirection: 'row', gap: spacing.sm },
  toggleButton: { flex: 1 },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateSmall: { flex: 1, minWidth: 64 },
  dateLarge: { flex: 1.4, minWidth: 84 },
  error: { ...type.caption, color: colors.danger, fontWeight: '600' },
  result: { gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.primary },
  resultPercent: { ...type.heading, color: colors.text },
  chipRow: { flexDirection: 'row' },
  body: { ...type.body, color: colors.text },
  caption: { ...type.caption, color: colors.textMuted },
  consentTitle: { ...type.heading, color: colors.text },
  jsonBox: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    backgroundColor: '#0F1720',
    padding: spacing.md,
  },
  json: { ...type.mono, color: '#E6EDF3' },
});
