import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Category } from '../../types';
import { Button, IconButton } from '../ui';

interface TeachingSubjectsSheetProps {
  visible: boolean;
  categories: Category[];
  currentIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}

export const TeachingSubjectsSheet: React.FC<TeachingSubjectsSheetProps> = ({ visible, categories, currentIds, onSave, onClose }) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string[]>(currentIds);

  React.useEffect(() => {
    if (visible) setSelected(currentIds);
  }, [visible, currentIds]);

  if (!visible) return null;

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Quelles matières enseignez-vous ?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>On vous proposera ces catégories en priorité pour vos cours</Text>
          </View>
          <IconButton icon="close" onPress={onClose} variant="ghost" size={34} />
        </View>

        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {categories.map((cat) => {
              const isSelected = selected.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => toggle(cat.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <View style={[styles.cardIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : theme.colors.primarySoft }]}>
                    <Ionicons name={cat.icon as any} size={23} color={isSelected ? '#fff' : theme.colors.primary} />
                  </View>
                  <Text numberOfLines={2} style={[styles.cardLabel, { color: isSelected ? '#fff' : theme.colors.text }]}>{cat.name}</Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Button label="Enregistrer" onPress={() => onSave(selected)} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' } as const,
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14, 14, 19, 0.55)' } as const,
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700' },
  subtitle: { fontSize: 13.5, marginTop: 4, maxWidth: 260 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 4 },
  card: { width: '30%', borderRadius: 16, borderWidth: 1.5, padding: 13, alignItems: 'flex-start' },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  cardLabel: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center',
  },
});
