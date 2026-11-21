import { Ionicons } from '@expo/vector-icons';
import { SchoolLevel, Track } from '../types';

export interface LevelInfo {
  id: SchoolLevel;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
}

/** School levels shown on Home — "Collège" groups every collège class (1AS → 4AS/Brevet). */
export const LEVELS: LevelInfo[] = [
  { id: 'primaire', label: 'Primaire', subtitle: '1AF → 6AF', icon: 'happy-outline', gradient: ['#FDCB6E', '#E8A93C'] },
  { id: 'college', label: 'Collège', subtitle: '1AS → Brevet', icon: 'school-outline', gradient: ['#3D7FF7', '#2C63D6'] },
  { id: 'lycee', label: 'Lycée & Bac', subtitle: '5AS → 7ème', icon: 'ribbon-outline', gradient: ['#00B894', '#00785C'] },
  { id: 'concours', label: 'Concours', subtitle: 'Nationaux', icon: 'trophy-outline', gradient: ['#8A72F3', '#4432B0'] },
];

export function getLevelInfo(level?: SchoolLevel | null): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === level);
}

export function tracksForLevel(tracks: Track[], level: SchoolLevel): Track[] {
  return tracks.filter((t) => t.level === level).sort((a, b) => a.order - b.order);
}
