import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/layout';
import { Input, Button, IconButton, Chip } from '../../components/ui';
import { courses } from '../../data';
import { Teacher } from '../../types';

export const ScheduleLiveScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const teacher = user as Teacher;
  const myCourses = courses.filter((c) => c.teacherId === teacher?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(myCourses[0]?.id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins le titre, la date et l\'heure.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    Alert.alert('Live planifié 🎉', `"${title}" est programmé le ${date} à ${time}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer edges={['top']} scroll>
      <View style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Planifier un live</Text>
      </View>

      <Input label="Titre de la session" placeholder="Ex : Session Q&A React Native" icon="radio-outline" value={title} onChangeText={setTitle} />
      <Input
        label="Description"
        placeholder="Décrivez le contenu de votre session..."
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ height: 90, textAlignVertical: 'top', paddingTop: 12 }}
      />

      <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Cours associé</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {myCourses.map((c) => (
          <Chip key={c.id} label={c.title} selected={selectedCourseId === c.id} onPress={() => setSelectedCourseId(c.id)} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Input label="Date" placeholder="JJ/MM/AAAA" icon="calendar-outline" value={date} onChangeText={setDate} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Heure" placeholder="18:00" icon="time-outline" value={time} onChangeText={setTime} />
        </View>
      </View>
      <Input label="Durée (minutes)" placeholder="60" icon="hourglass-outline" keyboardType="number-pad" value={duration} onChangeText={setDuration} />

      <Button label="Planifier la session" icon="checkmark-circle-outline" onPress={handleSchedule} loading={submitting} style={{ marginTop: 12 }} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', marginLeft: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
});
