import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { ScreenContainer } from '../../components/layout';
import { IconButton, EmptyState } from '../../components/ui';
import { useCatalog } from '../../context/CatalogContext';
import { CoursePdf } from '../../types';

type PdfRoute = RouteProp<{ PdfLibrary: { courseId: string } }, 'PdfLibrary'>;

export const PdfLibraryScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<PdfRoute>();
  const navigation = useNavigation();
  const { getCourseById } = useCatalog();
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  const course = getCourseById(route.params.courseId);
  if (!course) return null;

  const handleDownload = (pdf: CoursePdf) => {
    if (downloaded[pdf.id]) {
      Alert.alert('Déjà téléchargé', `${pdf.title} est disponible hors ligne.`);
      return;
    }
    setDownloading(pdf.id);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded((prev) => ({ ...prev, [pdf.id]: true }));
    }, 1200);
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Bibliothèque PDF</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{course.title}</Text>
        </View>
      </View>

      <FlatList
        data={course.pdfs}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isDownloading = downloading === item.id;
          const isDone = downloaded[item.id];
          return (
            <View style={[styles.card, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.dangerLight }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.danger} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={2} style={[styles.pdfTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.pdfMeta, { color: theme.colors.textMuted }]}>{item.pages} pages · {item.sizeMb} Mo</Text>
              </View>
              <Pressable onPress={() => handleDownload(item)} style={styles.downloadBtn}>
                <Ionicons
                  name={isDone ? 'checkmark-circle' : isDownloading ? 'ellipsis-horizontal-circle' : 'download-outline'}
                  size={24}
                  color={isDone ? theme.colors.secondary : theme.colors.primary}
                />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon="document-outline" title="Aucun support PDF" description="Ce cours ne propose pas encore de support téléchargeable." />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pdfTitle: { fontSize: 13.5, fontWeight: '700', lineHeight: 18 },
  pdfMeta: { fontSize: 11.5, marginTop: 4 },
  downloadBtn: { padding: 4 },
});
