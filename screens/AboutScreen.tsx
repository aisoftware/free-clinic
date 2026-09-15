import { Ionicons } from '@expo/vector-icons';
import { useState, useSyncExternalStore } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, SectionTitle } from '../components/Card';
import { Screen } from '../components/Screen';
import { isForcingSample, SERVERS, setForceSample, SOURCE_LABELS, sourceStatus } from '../lib/fhir/client';
import { accessMatrix, ROLES } from '../lib/roles';
import { useAppState } from '../state/AppState';
import { colors, radius, spacing, touchTarget, type } from '../theme';

const IS = [
  'A volunteer-facing mobile app for a free and charitable clinic, built against FHIR R4.',
  'A demonstration of FHIR R4 standards capability on synthetic data from public sandboxes.',
];

const IS_NOT = [
  'Not a production EHR integration.',
  'Not HIPAA-compliant on its own: there is no authentication, audit log, or covered hosting.',
  'Not connected to athenaOne or any other vendor system.',
  'Not a medical record. Nothing is written to any server.',
];

const QUERIES = [
  'Patient?_count=20&_sort=family',
  'Patient?name={text}&_count=20&_sort=family',
  'Condition?patient={id}',
  'MedicationRequest?patient={id}',
  'Coverage?patient={id}',
  'Observation?patient={id}&category=vital-signs&_sort=-date&_count=20',
  'Encounter?patient={id}&_sort=-date',
];

const ARCHITECTURE = [
  'Screens render view models only; mappers in lib/fhir convert raw FHIR resources.',
  'One typed client runs every search: 8 s timeout, one retry, then SMART, HAPI, and bundled sample data in turn.',
  'Chart queries stay on the server the patient came from; a failure offers retry, never another record.',
  'Role gating is one can(role, capability) table; locked tabs never request their data.',
  'Clinic rules are pure functions: the PAP heuristic and the 2026 FPL sliding fee.',
  'Check-ins, PAP progress, and intake live in memory only; nothing is stored on the device.',
  'Every network screen has skeleton, empty, error-with-retry, and sample-data fallback states.',
  'Expo SDK 56, strict TypeScript, React Navigation; imports into Expo Snack unchanged.',
];

const LINKS = [
  { label: 'Larry Brooks on LinkedIn', url: 'https://www.linkedin.com/in/aisoftware' },
  { label: 'Source code on GitHub', url: 'https://github.com/aisoftware/free-clinic' },
];

function Bullets({ items, icon, tone }: { items: string[]; icon: 'checkmark-circle' | 'close-circle' | 'ellipse'; tone: string }) {
  return (
    <View style={styles.bullets}>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <Ionicons name={icon} size={icon === 'ellipse' ? 6 : 18} color={tone} style={icon === 'ellipse' ? styles.dot : undefined} />
          <Text style={styles.body}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function AboutScreen() {
  const { bumpDataEpoch } = useAppState();
  const source = useSyncExternalStore(sourceStatus.subscribe, sourceStatus.get, sourceStatus.get);
  const [forcing, setForcing] = useState(isForcingSample());

  const toggleSample = (value: boolean) => {
    setForceSample(value);
    setForcing(value);
    // Reload patient lists so every screen reflects the new source.
    bumpDataEpoch();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title} accessibilityRole="header">
            Free Clinic Companion
          </Text>
          <Text style={styles.subtitle}>FHIR R4 on Expo, with compliance habits built in</Text>
        </View>

        <View>
          <SectionTitle>What this is</SectionTitle>
          <Card>
            <Bullets items={IS} icon="checkmark-circle" tone={colors.success} />
          </Card>
        </View>

        <View>
          <SectionTitle>What this is not</SectionTitle>
          <Card>
            <Bullets items={IS_NOT} icon="close-circle" tone={colors.danger} />
          </Card>
        </View>

        <View>
          <SectionTitle>Data source</SectionTitle>
          <Card style={styles.gap}>
            <Text style={styles.body}>
              Currently showing: <Text style={styles.strong}>{source ? SOURCE_LABELS[source] : 'Not loaded yet'}</Text>
            </Text>
            <Text style={styles.caption}>Primary: {SERVERS.smart.baseUrl}</Text>
            <Text style={styles.caption}>Fallback: {SERVERS.hapi.baseUrl}, then bundled sample data</Text>
            <View style={styles.switchRow}>
              <Text style={[styles.body, styles.flex]}>Use bundled sample data only</Text>
              <Switch
                value={forcing}
                onValueChange={toggleSample}
                trackColor={{ true: colors.primary, false: colors.border }}
                accessibilityLabel="Use bundled sample data only"
              />
            </View>
            <Text style={styles.caption}>Shows the offline experience without turning off the network. Open charts keep their source.</Text>
          </Card>
        </View>

        <View>
          <SectionTitle>FHIR queries used</SectionTitle>
          <Card style={styles.gap}>
            {QUERIES.map((q) => (
              <Text key={q} style={styles.mono} selectable>
                GET {q}
              </Text>
            ))}
            <Text style={styles.caption}>Read-only GET searches with an Accept header only, so browsers never need a CORS preflight.</Text>
          </Card>
        </View>

        <View>
          <SectionTitle>Architecture</SectionTitle>
          <Card>
            <Bullets items={ARCHITECTURE} icon="ellipse" tone={colors.textMuted} />
          </Card>
        </View>

        <View>
          <SectionTitle>Who sees what</SectionTitle>
          <Card style={styles.gap}>
            {accessMatrix().map((row) => (
              <View key={row.capability} style={styles.matrixRow}>
                <Text style={styles.strongSmall}>{row.description}</Text>
                <Text style={styles.caption}>
                  {ROLES.filter((r) => row.roles.includes(r.id))
                    .map((r) => r.label)
                    .join(', ')}
                </Text>
              </View>
            ))}
            <Text style={styles.caption}>Generated from lib/roles.ts, the single table every screen checks.</Text>
          </Card>
        </View>

        <View>
          <SectionTitle>Author</SectionTitle>
          <Card style={styles.gap}>
            <Text style={styles.body}>
              Built by Larry Brooks, Applied Intelligence Software. Workflows reflect volunteer CTO work at Health and Hope Clinic in
              Pensacola; no clinic data, names, or identifiers are used.
            </Text>
            {LINKS.map((link) => (
              <Pressable
                key={link.url}
                onPress={() => Linking.openURL(link.url)}
                accessibilityRole="link"
                accessibilityLabel={link.label}
                style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="open-outline" size={18} color={colors.primary} />
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  gap: { gap: spacing.sm },
  bullets: { gap: spacing.sm },
  bullet: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  dot: { marginTop: 8 },
  body: { ...type.body, color: colors.text, flexShrink: 1 },
  strong: { fontWeight: '600' },
  strongSmall: { ...type.bodyStrong, color: colors.text },
  caption: { ...type.caption, color: colors.textMuted },
  mono: { ...type.mono, color: colors.text, backgroundColor: colors.surfaceMuted, padding: spacing.sm, borderRadius: radius.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget },
  matrixRow: { gap: 2, paddingBottom: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: touchTarget },
  linkText: { ...type.bodyStrong, color: colors.primary },
});
