import { Student } from '../types';

export const students: Student[] = [
  {
    id: 'student-1',
    fullName: 'Yasmine El Amrani',
    email: 'yasmine.elamrani@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'student',
    bio: "Étudiante en informatique, passionnée par le développement web.",
    enrolledCourseIds: ['course-1', 'course-3', 'course-5'],
    favoriteCourseIds: ['course-2', 'course-9'],
    purchasedCourseIds: ['course-1', 'course-3', 'course-5'],
    createdAt: '2023-09-04',
  },
  {
    id: 'student-2',
    fullName: 'Thomas Girard',
    email: 'thomas.girard@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: 'student',
    bio: 'Reconversion professionnelle vers la data science.',
    enrolledCourseIds: ['course-2', 'course-6'],
    favoriteCourseIds: ['course-1'],
    purchasedCourseIds: ['course-2', 'course-6'],
    createdAt: '2024-01-22',
  },
  {
    id: 'student-3',
    fullName: 'Amine Cherif',
    email: 'amine.cherif@gmail.com',
    avatar: 'https://i.pravatar.cc/150?img=51',
    role: 'student',
    bio: 'Freelance en marketing digital.',
    enrolledCourseIds: ['course-5', 'course-7'],
    favoriteCourseIds: [],
    purchasedCourseIds: ['course-5', 'course-7'],
    createdAt: '2023-05-10',
  },
];

export const currentStudent: Student = students[0];
