import { Ionicons } from '@expo/vector-icons';
import { Course, OfferType, Track } from '../types';

export interface OfferInfo {
  id: OfferType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  /** Mirrors OFFER_DISCOUNTS in backend/commerce/views.py */
  discount: number;
}

export const OFFERS: Record<Exclude<OfferType, 'single'>, OfferInfo> = {
  full: {
    id: 'full',
    label: 'Pack complet',
    description: 'Toutes les matières de ta classe',
    icon: 'layers-outline',
    gradient: ['#00B894', '#00785C'],
    discount: 0.2,
  },
  main: {
    id: 'main',
    label: 'Matières principales',
    description: 'Les matières à fort coefficient',
    icon: 'star-outline',
    gradient: ['#3D7FF7', '#2C63D6'],
    discount: 0.1,
  },
  secondary: {
    id: 'secondary',
    label: 'Matières secondaires',
    description: 'Pour compléter ta moyenne',
    icon: 'albums-outline',
    gradient: ['#8A72F3', '#4432B0'],
    discount: 0.1,
  },
  teacher: {
    id: 'teacher',
    label: 'Un professeur',
    description: 'Tous les cours du prof de ton choix',
    icon: 'person-outline',
    gradient: ['#FF6B6B', '#E64A4A'],
    discount: 0.1,
  },
};

export interface OfferBundle {
  offer: OfferType;
  courses: Course[];
  /** Courses that still need to be bought (not owned, not free). */
  toBuy: Course[];
  freeCourses: Course[];
  basePrice: number;
  price: number;
  savings: number;
}

export function coursesForTrack(courses: Course[], track?: Track | null): Course[] {
  if (!track) return [];
  return courses.filter((c) => !c.isClosed && c.gradeTracks.includes(track.id));
}

export function offerCourses(offer: OfferType, courses: Course[], track: Track | null | undefined, teacherId?: string): Course[] {
  const forTrack = coursesForTrack(courses, track);
  switch (offer) {
    case 'full':
      return forTrack;
    case 'main':
      return forTrack.filter((c) => track?.mainCategoryIds.includes(c.categoryId));
    case 'secondary':
      return forTrack.filter((c) => !track?.mainCategoryIds.includes(c.categoryId));
    case 'teacher': {
      const own = courses.filter((c) => !c.isClosed && c.teacherId === teacherId);
      const inTrack = own.filter((c) => !track || c.gradeTracks.includes(track.id));
      return inTrack.length > 0 ? inTrack : own;
    }
    default:
      return [];
  }
}

export function buildBundle(offer: OfferType, list: Course[], isOwned: (id: string) => boolean): OfferBundle {
  const notOwned = list.filter((c) => !isOwned(c.id));
  const freeCourses = notOwned.filter((c) => c.isFree);
  const toBuy = notOwned.filter((c) => !c.isFree);
  const basePrice = toBuy.reduce((sum, c) => sum + c.price, 0);
  const discount = offer !== 'single' && toBuy.length > 1 ? OFFERS[offer as Exclude<OfferType, 'single'>].discount : 0;
  const price = toBuy.reduce((sum, c) => sum + Math.round(c.price * (1 - discount)), 0);
  return { offer, courses: list, toBuy, freeCourses, basePrice, price, savings: basePrice - price };
}

export const TERM_LABELS: Record<number, string> = { 1: '1er trimestre', 2: '2ème trimestre', 3: '3ème trimestre' };

export const CONTENT_TYPE_INFO: Record<Course['contentType'], { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  video: { label: 'Vidéo', icon: 'videocam-outline' },
  pdf: { label: 'PDF', icon: 'document-text-outline' },
  both: { label: 'Vidéo + PDF', icon: 'play-circle-outline' },
};
