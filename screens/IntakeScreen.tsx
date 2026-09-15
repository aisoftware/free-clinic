import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { LockNotice } from '../components/LockNotice';
import { Screen } from '../components/Screen';
import { INTAKE_STRINGS } from '../lib/i18n/intake';
import { can } from '../lib/roles';
import { useAppState } from '../state/AppState';
import { colors, radius, spacing, type } from '../theme';
import { emptyForm, Errors, IntakeForm, validateStep } from './intake/form';
import { ConsentStep, DemographicsStep, HouseholdStep, ReviewStep } from './intake/steps';

// Intake is local state only. Nothing is written to the sandbox: a shared public server is not a
// place to create patient records, and the review step shows exactly what would be sent instead.

const LAST_STEP = 3;

export function IntakeScreen() {
  const navigation = useNavigation();
  const { role } = useAppState();
  const headerHeight = useHeaderHeight();
  const [form, setForm] = useState<IntakeForm>(() => emptyForm());
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [signing, setSigning] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const t = INTAKE_STRINGS[form.language];

  useEffect(() => {
    navigation.setOptions({ title: can(role, 'intake.create') ? t.title : 'Intake' });
  }, [navigation, t, role]);

  const update = (change: Partial<IntakeForm>) => {
    const nextForm = { ...form, ...change };
    setForm(nextForm);
    // After a failed Next, re-validate as the volunteer fixes each field.
    if (attempted) setErrors(validateStep(step, nextForm, INTAKE_STRINGS[nextForm.language]));
  };

  const goTo = (target: number) => {
    setStep(target);
    setErrors({});
    setAttempted(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const next = () => {
    const found = validateStep(step, form, t);
    setErrors(found);
    setAttempted(true);
    if (Object.keys(found).length === 0) goTo(Math.min(LAST_STEP, step + 1));
  };

  if (!can(role, 'intake.create')) {
    return (
      <Screen>
        <View style={styles.locked}>
          <LockNotice capability="intake.create" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEnabled={!signing}
        >
          <View style={styles.progress} accessibilityRole="progressbar" accessibilityLabel={t.stepOf(step + 1, LAST_STEP + 1)}>
            <Text style={styles.stepOf}>{t.stepOf(step + 1, LAST_STEP + 1)}</Text>
            <Text style={styles.stepTitle} accessibilityRole="header">
              {t.steps[step]}
            </Text>
            <View style={styles.bars}>
              {t.steps.map((label, i) => (
                <View key={label} style={[styles.bar, i <= step && styles.barDone]} />
              ))}
            </View>
          </View>

          {step === 0 && <DemographicsStep form={form} update={update} errors={errors} t={t} />}
          {step === 1 && <HouseholdStep form={form} update={update} errors={errors} t={t} />}
          {step === 2 && <ConsentStep form={form} update={update} errors={errors} t={t} role={role} onSigningChange={setSigning} />}
          {step === 3 && (
            <ReviewStep
              form={form}
              update={update}
              errors={errors}
              t={t}
              onStartOver={() => {
                setForm(emptyForm());
                goTo(0);
              }}
            />
          )}

          {step < LAST_STEP ? (
            <View style={styles.nav}>
              {step > 0 ? <Button label={t.back} variant="secondary" icon="chevron-back" onPress={() => goTo(step - 1)} style={styles.navButton} /> : null}
              <Button label={step === LAST_STEP - 1 ? t.review : t.next} onPress={next} style={styles.navButton} />
            </View>
          ) : (
            <Button label={t.back} variant="ghost" icon="chevron-back" onPress={() => goTo(step - 1)} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  locked: { padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  progress: { gap: spacing.xs },
  stepOf: { ...type.label, color: colors.textMuted },
  stepTitle: { ...type.title, color: colors.text },
  bars: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  bar: { flex: 1, height: 4, borderRadius: radius.pill, backgroundColor: colors.border },
  barDone: { backgroundColor: colors.primary },
  nav: { flexDirection: 'row', gap: spacing.sm },
  navButton: { flex: 1 },
});
