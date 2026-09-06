import { Student } from '../types';

export const students: Student[] = [
  {
    id: 'student-1',
    fullName: 'Mariem Mint Abdellahi',
    email: 'mariem.abdellahi@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'student',
    bio: 'Élève en Terminale Série C au Lycée Moderne de Nouakchott.',
    enrolledCourseIds: ['course-1', 'course-3', 'course-5'],
    favoriteCourseIds: ['course-2', 'course-9'],
    purchasedCourseIds: ['course-1', 'course-3', 'course-5'],
    createdAt: '2023-09-04',
  },
  {
    id: 'student-2',
    fullName: 'Cheikh Ould Beibacar',
    email: 'cheikh.beibacar@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: 'student',
    bio: 'Élève en Terminale Série D, passionné de sciences.',
    enrolledCourseIds: ['course-2', 'course-6'],
    favoriteCourseIds: ['course-1'],
    purchasedCourseIds: ['course-2', 'course-6'],
    createdAt: '2024-01-22',
  },
  {
    id: 'student-3',
    fullName: 'Aminetou Mint Sidi',
    email: 'aminetou.sidi@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=51',
    role: 'student',
    bio: "Candidate au concours d'entrée à l'ENA.",
    enrolledCourseIds: ['course-5', 'course-7'],
    favoriteCourseIds: [],
    purchasedCourseIds: ['course-5', 'course-7'],
    createdAt: '2023-05-10',
  },
];

export const currentStudent: Student = students[0];
