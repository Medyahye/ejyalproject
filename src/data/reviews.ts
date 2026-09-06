import { Review } from '../types';

export const reviews: Review[] = [
  { id: 'rev-1', courseId: 'course-1', studentName: 'Mariem Mint Abdellahi', studentAvatar: 'https://i.pravatar.cc/150?img=5', rating: 5, comment: "Excellent cours, les explications sur les probabilités m'ont beaucoup aidée pour le Bac blanc !", date: '2026-07-12' },
  { id: 'rev-2', courseId: 'course-1', studentName: 'Zeinabou Mint Moctar', studentAvatar: 'https://i.pravatar.cc/150?img=22', rating: 5, comment: 'Le meilleur professeur de mathématiques que j\'ai eu, tout est clair et bien expliqué.', date: '2026-06-28' },
  { id: 'rev-3', courseId: 'course-1', studentName: 'Bilal Ould Cheikh', studentAvatar: 'https://i.pravatar.cc/150?img=9', rating: 4, comment: "Très bon contenu, j'aurais aimé plus d'exercices corrigés.", date: '2026-06-02' },
  { id: 'rev-4', courseId: 'course-2', studentName: 'Cheikh Ould Beibacar', studentAvatar: 'https://i.pravatar.cc/150?img=15', rating: 5, comment: "Grâce à ce cours j'ai enfin compris la mécanique, merci professeure !", date: '2026-07-01' },
  { id: 'rev-5', courseId: 'course-2', studentName: 'Maimouna Mint Yerim', studentAvatar: 'https://i.pravatar.cc/150?img=25', rating: 5, comment: 'Parfait pour réviser avant le Bac, exercices très proches du sujet réel.', date: '2026-05-18' },
  { id: 'rev-6', courseId: 'course-3', studentName: 'Mariem Mint Abdellahi', studentAvatar: 'https://i.pravatar.cc/150?img=5', rating: 4, comment: 'Cours très riche sur la Balagha, vraiment utile pour la série O.', date: '2026-06-15' },
  { id: 'rev-7', courseId: 'course-5', studentName: 'Aminetou Mint Sidi', studentAvatar: 'https://i.pravatar.cc/150?img=51', rating: 5, comment: "La simulation d'entretien oral était incroyablement réaliste.", date: '2026-04-22' },
  { id: 'rev-8', courseId: 'course-9', studentName: 'Zeinabou Mint Moctar', studentAvatar: 'https://i.pravatar.cc/150?img=22', rating: 5, comment: "J'ai enfin compris l'histoire précoloniale de la Mauritanie grâce à ce cours.", date: '2026-03-11' },
];

export function getReviewsByCourse(courseId: string): Review[] {
  return reviews.filter((r) => r.courseId === courseId);
}
