import { Ionicons } from '@expo/vector-icons';
import { GradeTrack } from '../types';

export interface GradeTrackInfo {
  id: GradeTrack;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const GRADE_TRACKS: GradeTrackInfo[] = [
  { id: 'bac-c', label: 'Bac Série C', shortLabel: 'Série C', icon: 'calculator-outline' },
  { id: 'bac-d', label: 'Bac Série D', shortLabel: 'Série D', icon: 'flask-outline' },
  { id: 'bac-a', label: 'Bac Séries A / AB', shortLabel: 'Séries A/AB', icon: 'book-outline' },
  { id: 'bac-o', label: 'Bac Série O', shortLabel: 'Série O', icon: 'reader-outline' },
  { id: 'brevet', label: 'Brevet (BEPC)', shortLabel: 'Brevet', icon: 'school-outline' },
  { id: 'concours', label: 'Concours', shortLabel: 'Concours', icon: 'trophy-outline' },
];

export function getGradeTrackInfo(id?: GradeTrack | '' | null): GradeTrackInfo | undefined {
  return GRADE_TRACKS.find((t) => t.id === id);
}
