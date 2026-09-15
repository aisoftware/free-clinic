import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckInChip } from '../components/Chip';
import { Screen } from '../components/Screen';
import { EmptyState, ErrorState, SkeletonRows } from '../components/StateViews';
import { search } from '../lib/fhir/client';
import { PatientVM, toPatientVM } from '../lib/fhir/mappers';
import type { PatientsStackParamList } from '../navigation/types';
import { checkInStatusOf, useAppState } from '../state/AppState';
import { useQuery } from '../state/useQuery';
import { colors, radius, shadow, spacing, touchTarget, type } from '../theme';

type Props = NativeStackScreenProps<PatientsStackParamList, 'PatientList'>;

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function PatientsScreen({ navigation }: Props) {
  const { checkIns, setLoadedPatients } = useAppState();
  const [term, setTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const name = useDebounced(term.trim(), 350);

  const query = useQuery(async ({ fresh }) => {
    const result = await search('Patient', { name: name || undefined, _count: 20, _sort: 'family' }, { fresh });
    return result.entries.map((p) => toPatientVM(p, result.source));
  }, [name]);

  useEffect(() => {
    if (query.data && !name) setLoadedPatients(query.data);
  }, [query.data, name, setLoadedPatients]);

  let content;
  if (query.loading && !query.data) {
    content = <SkeletonRows count={7} />;
  } else if (query.error && !query.data) {
    content = <ErrorState message={query.error} onRetry={query.reload} />;
  } else {
    content = (
      <FlatList
        data={query.data ?? []}
        keyExtractor={(p) => p.key}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={query.refreshing} onRefresh={query.refresh} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <PatientRow
            patient={item}
            status={checkInStatusOf(checkIns, item.key)}
            onPress={() => navigation.navigate('PatientDetail', { patient: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={name ? `No patients match "${name}"` : 'No patients found'}
            body={name ? 'Search matches the start of a first or last name.' : 'The sandbox returned an empty list. Pull down to refresh.'}
          />
        }
      />
    );
  }

  return (
    <Screen>
      <View style={[styles.searchWrap, focused && styles.searchWrapFocused]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={term}
          onChangeText={setTerm}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by first or last name"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          accessibilityLabel="Search patients by name"
          clearButtonMode="while-editing"
        />
      </View>
      {content}
    </Screen>
  );
}

function PatientRow({ patient, status, onPress }: { patient: PatientVM; status: ReturnType<typeof checkInStatusOf>; onPress: () => void }) {
  const meta = [patient.age !== null ? `${patient.age} y` : 'Age unknown', patient.sex].join(' · ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${patient.givenFirst}, ${meta}, ${patient.mrn ? `MRN ${patient.mrn}` : 'no ID'}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowMain}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.meta}>{meta}</Text>
        <Text style={styles.mrn}>{patient.mrnShort ? `MRN ${patient.mrnShort}` : 'No ID'}</Text>
      </View>
      <View style={styles.rowSide}>
        <CheckInChip status={status} />
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchWrapFocused: { borderColor: colors.primary, borderWidth: 2, paddingHorizontal: spacing.md - 1 },
  searchInput: {
    ...type.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
    // The surrounding field already shows focus; suppress the browser's second outline.
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
  },
  listContent: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: touchTarget,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow,
  },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  rowMain: { flex: 1, gap: 2 },
  rowSide: { alignItems: 'flex-end', gap: spacing.sm, flexDirection: 'row' },
  name: { ...type.bodyStrong, color: colors.text },
  meta: { ...type.caption, color: colors.textMuted },
  mrn: { ...type.caption, color: colors.textMuted, fontVariant: ['tabular-nums'] },
});
