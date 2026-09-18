import { Ionicons } from '@expo/vector-icons';
import { GradeTrack } from '../types';

export interface GradeTrackInfo {
  id: GradeTrack;
  label: string;
  shortLabel: string;
  code: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const GRADE_TRACKS: GradeTrackInfo[] = [
  { id: 'bac-c', label: 'Bac Série C', shortLabel: 'Série C', code: '7C', icon: 'calculator-outline', color: '#00B894' },
  { id: 'bac-d', label: 'Bac Série D', shortLabel: 'Série D', code: '7D', icon: 'flask-outline', color: '#00B894' },
  { id: 'bac-lm', label: 'Bac Série LM', shortLabel: 'Série LM', code: '7LM', icon: 'book-outline', color: '#00B894' },
  { id: 'bac-lo', label: 'Bac Série LO', shortLabel: 'Série LO', code: '7LO', icon: 'reader-outline', color: '#00B894' },
  { id: 'bac-t', label: 'Bac Série T', shortLabel: 'Série T', code: '7T', icon: 'construct-outline', color: '#00B894' },
  { id: 'brevet', label: 'Brevet (BEPC)', shortLabel: 'Brevet', code: 'BR', icon: 'school-outline', color: '#00B894' },
  { id: 'concours', label: 'Concours', shortLabel: 'Concours', code: 'CO', icon: 'trophy-outline', color: '#00B894' },
];

export function getGradeTrackInfo(id?: GradeTrack | '' | null): GradeTrackInfo | undefined {
  return GRADE_TRACKS.find((t) => t.id === id);
}
