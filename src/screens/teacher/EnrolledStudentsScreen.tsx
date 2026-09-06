import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeacherDrawerScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useTeacherData } from '../../context/TeacherDataContext';
import { ScreenContainer } from '../../components/layout';
import { Avatar, EmptyState, IconButton } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

type Props = TeacherDrawerScreenProps<'EnrolledStudents'>;

function avatarForStudent(studentId: string): string {
  const hash = studentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `https://i.pravatar.cc/150?img=${(hash % 70) + 1}`;
}

export const EnrolledStudentsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { payments } = useTeacherData();
  const [query, setQuery] = useState('');

  const enrollments = useMemo(() => {
    return payments.filter((p) => p.status === 'Réussi').map((p) => ({ ...p, avatar: avatarForStudent(p.studentId) }));
  }, [payments]);

  const filtered = enrollments.filter(
    (e) => e.studentName.toLowerCase().includes(query.toLowerCase()) || e.courseTitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Étudiants inscrits ({enrollments.length})</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.backgroundAlt }]}>
        <Ionicons name="search" size={16} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un étudiant ou un cours..."
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
            <Avatar uri={item.avatar} size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{item.studentName}</Text>
              <Text numberOfLines={1} style={[styles.course, { color: theme.colors.textSecondary }]}>{item.courseTitle}</Text>
              <Text style={[styles.date, { color: theme.colors.textMuted }]}>Inscrit le {formatDate(item.date)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Aucun étudiant trouvé" />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '800', marginLeft: 4, flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13.5 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 10 },
  name: { fontSize: 13.5, fontWeight: '700' },
  course: { fontSize: 12, marginTop: 3 },
  date: { fontSize: 11, marginTop: 3 },
});
