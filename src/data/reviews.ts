import { Review } from '../types';

export const reviews: Review[] = [
  { id: 'rev-1', courseId: 'course-1', studentName: 'Yasmine El Amrani', studentAvatar: 'https://i.pravatar.cc/150?img=5', rating: 5, comment: 'Cours incroyablement complet ! J\'ai pu publier ma première app en 2 mois.', date: '2026-07-12' },
  { id: 'rev-2', courseId: 'course-1', studentName: 'Nicolas Petit', studentAvatar: 'https://i.pravatar.cc/150?img=22', rating: 5, comment: 'La meilleure formation React Native que j\'ai suivie. Explications très claires.', date: '2026-06-28' },
  { id: 'rev-3', courseId: 'course-1', studentName: 'Fatima Zahra', studentAvatar: 'https://i.pravatar.cc/150?img=9', rating: 4, comment: 'Très bon contenu, quelques sections auraient pu être plus approfondies.', date: '2026-06-02' },
  { id: 'rev-4', courseId: 'course-2', studentName: 'Thomas Girard', studentAvatar: 'https://i.pravatar.cc/150?img=15', rating: 5, comment: 'Enseignant passionnant, les projets pratiques sont excellents.', date: '2026-07-01' },
  { id: 'rev-5', courseId: 'course-2', studentName: 'Sofia Rossi', studentAvatar: 'https://i.pravatar.cc/150?img=25', rating: 5, comment: 'Parfait pour progresser rapidement en data science.', date: '2026-05-18' },
  { id: 'rev-6', courseId: 'course-3', studentName: 'Yasmine El Amrani', studentAvatar: 'https://i.pravatar.cc/150?img=5', rating: 4, comment: 'Super pour débuter avec Figma, très pédagogique.', date: '2026-06-15' },
  { id: 'rev-7', courseId: 'course-5', studentName: 'Amine Cherif', studentAvatar: 'https://i.pravatar.cc/150?img=51', rating: 5, comment: 'Stratégies concrètes et applicables immédiatement.', date: '2026-04-22' },
  { id: 'rev-8', courseId: 'course-9', studentName: 'Nicolas Petit', studentAvatar: 'https://i.pravatar.cc/150?img=22', rating: 5, comment: 'Explications limpides sur les génériques TypeScript.', date: '2026-03-11' },
];

export function getReviewsByCourse(courseId: string): Review[] {
  return reviews.filter((r) => r.courseId === courseId);
}
