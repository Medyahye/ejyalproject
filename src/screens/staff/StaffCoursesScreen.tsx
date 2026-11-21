import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, Pressable, TextInput, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { ScreenContainer } from '../../components/layout';
import { EmptyState } from '../../components/ui';
import { fetchStaffCourses, updateStaffCourse } from '../../api/staff';
import { Course } from '../../types';
import { formatDateShort, formatPrice } from '../../utils/formatters';
import { haptics } from '../../utils/haptics';
import { ApiError } from '../../api/client';
import { inOneMonth } from './StaffTeachersScreen';

export const StaffCoursesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { refresh: refreshCatalog } = useCatalog();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setCourses(await fetchStaffCourses().catch(() => []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? courses.filter((c) => `${c.title} ${c.teacherName} ${c.categoryName}`.toLowerCase().includes(q)) : courses;
  }, [courses, query]);

  const update = async (c: Course, changes: Partial<Pick<Course, 'isClosed' | 'promoFreeUntil' | 'term'>>) => {
    setCourses((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...changes } : x)));
    try {
      const saved = await updateStaffCourse(c.id, changes);
      setCourses((prev) => prev.map((x) => (x.id === c.id ? saved : x)));
      refreshCatalog().catch(() => {});
    } catch (err) {
      Alert.alert('Erreur', err instanceof ApiError ? err.message : 'Modification impossible.');
      load();
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Cours</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{courses.length} cours · visibilité, trimestre et promos</Text>
      <View style={[styles.search, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
        <Ionicons name="search" size={17} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Titre, professeur, matière…"
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.colors.primary}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        renderItem={({ item, index }) => {
          const promo = !!item.promoFreeUntil && item.isFree;
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify()}>
              <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
                <View style={styles.row}>
                  <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text numberOfLines={2} style={[styles.name, { color: theme.colors.text }]}>{item.title}</Text>
                    <Text numberOfLines={1} style={[styles.meta, { color: theme.colors.textMuted }]}>
                      {item.teacherName} · {item.studentsCount} abonnés · {formatPrice(item.price)}
                    </Text>
                  </View>
                </View>

                <View style={styles.termRow}>
                  <Text style={[styles.lineLabel, { color: theme.colors.text, marginLeft: 0, flex: 0, marginRight: 10 }]}>Trimestre</Text>
                  {[1, 2, 3].map((n) => {
                    const active = item.term === n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => {
                          haptics.select();
                          update(item, { term: n });
                        }}
                        style={[styles.termChip, { backgroundColor: active ? theme.colors.primary : theme.colors.backgroundAlt }]}
                      >
                        <Text style={{ color: active ? '#fff' : theme.colors.text, fontWeight: '800', fontSize: 12.5 }}>T{n}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={[styles.line, { borderTopColor: theme.colors.border }]}>
                  <Ionicons name="gift-outline" size={18} color={theme.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.lineLabel, { color: theme.colors.text, marginLeft: 0 }]}>Promo gratuite</Text>
                    {promo && item.promoFreeUntil && (
                      <Text style={[styles.meta, { color: theme.colors.primary }]}>jusqu'au {formatDateShort(item.promoFreeUntil)}</Text>
                    )}
                  </View>
                  <Switch
                    value={promo}
                    onValueChange={(on) => update(item, { promoFreeUntil: on ? inOneMonth() : null })}
                    trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                  />
                </View>
                <View style={[styles.line, { borderTopColor: theme.colors.border }]}>
                  <Ionicons name={item.isClosed ? 'eye-off-outline' : 'eye-outline'} size={18} color={item.isClosed ? theme.colors.danger : theme.colors.primary} />
                  <Text style={[styles.lineLabel, { color: theme.colors.text }]}>Visible par les élèves</Text>
                  <Switch
                    value={!item.isClosed}
                    onValueChange={(visible) => {
                      haptics.select();
                      update(item, { isClosed: !visible });
                    }}
                    trackColor={{ true: theme.colors.primary, false: theme.colors.danger }}
                  />
                </View>
              </View>
            </Animated.View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="albums-outline" title="Aucun cours" />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 13, marginTop: 2, marginBottom: 14 },
  search: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 46, marginBottom: 14 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  card: { borderRadius: 20, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 62, height: 62, borderRadius: 14 },
  name: { fontSize: 14, fontWeight: '800', lineHeight: 19 },
  meta: { fontSize: 11.5, marginTop: 3 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  termChip: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  line: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 10, marginTop: 12 },
  lineLabel: { flex: 1, fontSize: 13.5, fontWeight: '700', marginLeft: 10 },
});
