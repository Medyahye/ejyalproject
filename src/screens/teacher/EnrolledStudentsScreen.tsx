import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="menu-outline" onPress={() => navigation.openDrawer()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Étudiants inscrits ({enrollments.length})</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(70).springify()} style={[styles.searchBar, { backgroundColor: theme.colors.backgroundAlt }]}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un étudiant ou un package..."
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.searchInput, { color: theme.colors.text }]}
        />
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 50).springify()}
            style={[styles.row, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <Avatar uri={item.avatar} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{item.studentName}</Text>
              <Text numberOfLines={1} style={[styles.course, { color: theme.colors.textSecondary }]}>{item.courseTitle}</Text>
              <Text style={[styles.date, { color: theme.colors.textMuted }]}>Inscrit le {formatDate(item.date)}</Text>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Aucun étudiant trouvé" />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 18 },
  title: { fontSize: 19.5, fontWeight: '700', marginLeft: 4, flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 48, marginBottom: 18 },
  searchInput: { flex: 1, marginLeft: 9, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10 },
  name: { fontSize: 15.5, fontWeight: '700' },
  course: { fontSize: 13.5, marginTop: 3 },
  date: { fontSize: 12.5, marginTop: 3 },
});
