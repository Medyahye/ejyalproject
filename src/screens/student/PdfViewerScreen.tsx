import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentStackScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';
import { useCatalog } from '../../context/CatalogContext';
import { useStudentData } from '../../context/StudentDataContext';
import { Button } from '../../components/ui';

type Props = StudentStackScreenProps<'PdfViewer'>;

/** iOS renders PDFs natively in the web view; Android's web view cannot, so it goes through Google's viewer. */
function viewerUrl(uri: string): string {
  if (Platform.OS === 'android') return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(uri)}`;
  return uri;
}

export const PdfViewerScreen: React.FC<Props> = ({ navigation, route }) => {
  // Same protection as the video player: no screenshots of the course documents.
  usePreventScreenCapture();

  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { courseId, lessonId, uri, title } = route.params;
  const { getCourseById } = useCatalog();
  const { isPurchased } = useStudentData();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const course = getCourseById(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const allowed = !!course && (isPurchased(course.id) || !!lesson?.isPreview) && !course.isLocked;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
          {!!course && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>{course.title}</Text>}
        </View>
        <View style={[styles.shield, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
          <Text style={[styles.shieldText, { color: theme.colors.primary }]}>Protégé</Text>
        </View>
      </View>

      {!allowed ? (
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={34} color={theme.colors.textMuted} />
          <Text style={[styles.msgTitle, { color: theme.colors.text }]}>Document réservé aux inscrits</Text>
        </View>
      ) : failed ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={34} color={theme.colors.textMuted} />
          <Text style={[styles.msgTitle, { color: theme.colors.text }]}>Impossible d'ouvrir le document</Text>
          <Button
            label="Réessayer"
            icon="refresh"
            fullWidth={false}
            style={{ marginTop: 16, paddingHorizontal: 24 }}
            onPress={() => {
              setFailed(false);
              setAttempt((a) => a + 1);
            }}
          />
        </View>
      ) : Platform.OS === 'web' ? (
        React.createElement('iframe', { key: attempt, src: uri, title, style: { flex: 1, border: 'none', width: '100%', height: '100%' } })
      ) : (
        <WebView
          key={attempt}
          source={{ uri: viewerUrl(uri) }}
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.center, StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          allowsLinkPreview={false}
          dataDetectorTypes="none"
          setSupportMultipleWindows={false}
          allowFileAccess={false}
          originWhitelist={['https://*']}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  back: { padding: 4 },
  title: { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 1 },
  shield: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  shieldText: { fontSize: 11, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  msgTitle: { fontSize: 15, fontWeight: '700', marginTop: 12, textAlign: 'center' },
});
