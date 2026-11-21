import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { CourseListItem } from '../../components/course';
import { EmptyState, Chip } from '../../components/ui';
import { useCatalog } from '../../context/CatalogContext';

type Props = StudentStackScreenProps<'Search'>;

const recentSearches = ['Mathématiques Terminale', 'Physique-Chimie', 'Brevet Arabe', 'Concours ENA'];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { courses } = useCatalog();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q) || c.categoryName.toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.backgroundAlt }]}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            autoFocus
            placeholder="Rechercher un cours, formateur..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text }]}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!query.trim() ? (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recherches récentes</Text>
          <View style={styles.recentWrap}>
            {recentSearches.map((term) => (
              <Chip key={term} label={term} onPress={() => setQuery(term)} icon="time-outline" />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>{results.length} résultat(s) pour "{query}"</Text>
          }
          renderItem={({ item }) => (
            <CourseListItem course={item} onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })} />
          )}
          ListEmptyComponent={
            <EmptyState icon="sad-outline" title="Aucun résultat" />
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 46 },
  input: { flex: 1, marginLeft: 8, fontSize: 14, height: '100%' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  recentWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  resultCount: { fontSize: 12.5, fontWeight: '600', marginBottom: 14 },
});
