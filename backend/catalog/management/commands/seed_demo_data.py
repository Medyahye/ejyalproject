from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from catalog.models import Category, Course, CoursePdf, Lesson, Review
from commerce.models import CartItem, Enrollment, Favorite, Payment
from live.models import LiveChatMessage, LiveSession

DEMO_PASSWORD = 'password123'

CATEGORIES = [
    ('cat-1', 'Mathématiques', 'calculator', '#6C5CE7'),
    ('cat-2', 'Physique-Chimie', 'flask', '#3D7FF7'),
    ('cat-3', 'Sciences de la Vie et de la Terre', 'leaf', '#00B894'),
    ('cat-4', 'Arabe & Lettres Originelles', 'book', '#E8A93C'),
    ('cat-5', 'Français & Lettres Modernes', 'chatbubbles', '#FF6B6B'),
    ('cat-6', 'Philosophie', 'bulb', '#8A72F3'),
    ('cat-7', 'Histoire-Géographie', 'earth', '#2C63D6'),
    ('cat-8', 'Anglais', 'language', '#FDCB6E'),
    ('cat-9', 'Concours & Culture Générale', 'trophy', '#00785C'),
]

TEACHERS = [
    dict(key='teacher-1', fullName='Mohamed Ould Sidi Ahmed', email='mohamed.sidiahmed@educonnect.mr', avatar='https://i.pravatar.cc/150?img=68',
         headline="Professeur agrégé de Mathématiques · Lycée d'Excellence de Nouakchott",
         bio="J'enseigne les mathématiques depuis 12 ans et j'aide mes élèves à aborder le Bac et le Brevet avec confiance.",
         specialties=['Analyse', 'Algèbre', 'Probabilités']),
    dict(key='teacher-2', fullName='Fatimetou Mint Cheikh', email='fatimetou.cheikh@educonnect.mr', avatar='https://i.pravatar.cc/150?img=32',
         headline='Professeure de Physique-Chimie et SVT · Lycée National de Nouakchott',
         bio="Je rends les sciences accessibles à travers des exercices proches des sujets d'examens officiels.",
         specialties=['Physique', 'Chimie organique', 'Génétique']),
    dict(key='teacher-3', fullName='Sidi Mohamed Ould Taleb', email='sidimohamed.taleb@educonnect.mr', avatar='https://i.pravatar.cc/150?img=12',
         headline="Professeur d'Arabe, Lettres Originelles et Philosophie",
         bio="Ancien enseignant au Mahadra, je transmets la maîtrise de la langue arabe et la réflexion philosophique.",
         specialties=['Grammaire arabe', 'Littérature classique', 'Philosophie']),
    dict(key='teacher-4', fullName='Aichetou Mint Ahmed Salem', email='aichetou.ahmedsalem@educonnect.mr', avatar='https://i.pravatar.cc/150?img=47',
         headline='Professeure de Français, Anglais et Histoire-Géographie · Préparatrice aux concours',
         bio="J'accompagne les élèves et candidats aux concours dans la maîtrise de la méthodologie et de l'expression.",
         specialties=['Dissertation', 'Anglais', 'Méthodologie concours']),
]

STUDENTS = [
    dict(key='student-1', fullName='Mariem Mint Abdellahi', email='mariem.abdellahi@gmail.com', avatar='https://i.pravatar.cc/150?img=5',
         bio='Élève en Terminale Série C au Lycée Moderne de Nouakchott.'),
    dict(key='student-2', fullName='Cheikh Ould Beibacar', email='cheikh.beibacar@gmail.com', avatar='https://i.pravatar.cc/150?img=15',
         bio='Élève en Terminale Série D, passionné de sciences.'),
    dict(key='student-3', fullName='Aminetou Mint Sidi', email='aminetou.sidi@gmail.com', avatar='https://i.pravatar.cc/150?img=51',
         bio='Candidate au concours d\'entrée à l\'ENA.'),
    dict(key='student-4', fullName='Abdellahi Ould Bilal', email='abdellahi.bilal@gmail.com', avatar='https://i.pravatar.cc/150?img=13', bio=''),
    dict(key='student-5', fullName='Khadijetou Mint Ahmed', email='khadijetou.ahmed@gmail.com', avatar='https://i.pravatar.cc/150?img=45', bio=''),
    dict(key='student-6', fullName='Yahya Ould Sidi', email='yahya.sidi@gmail.com', avatar='https://i.pravatar.cc/150?img=33', bio=''),
    dict(key='student-7', fullName='Salka Mint Boubacar', email='salka.boubacar@gmail.com', avatar='https://i.pravatar.cc/150?img=44', bio=''),
    dict(key='student-8', fullName='Ahmed Salem Ould Vall', email='ahmedsalem.vall@gmail.com', avatar='https://i.pravatar.cc/150?img=53', bio=''),
    dict(key='student-9', fullName='Zeinabou Mint Moctar', email='zeinabou.moctar@gmail.com', avatar='https://i.pravatar.cc/150?img=22', bio=''),
    dict(key='student-10', fullName='Bilal Ould Cheikh', email='bilal.cheikh@gmail.com', avatar='https://i.pravatar.cc/150?img=9', bio=''),
    dict(key='student-11', fullName='Maimouna Mint Yerim', email='maimouna.yerim@gmail.com', avatar='https://i.pravatar.cc/150?img=25', bio=''),
]


def make_lessons(titles, seed):
    return [
        dict(title=t, duration_minutes=8 + ((i * 7) % 25), is_preview=(i == 0),
             video_url='https://example.com/mock-video.mp4',
             thumbnail=f'https://picsum.photos/seed/{seed}-{i}/400/250', order=i)
        for i, t in enumerate(titles)
    ]


def make_pdfs(seed, count):
    return [
        dict(title=f'Support de cours {i + 1} — {seed}', size_mb=round(1.2 + i * 0.6, 1),
             pages=12 + i * 6, uri='https://example.com/mock-support.pdf', order=i)
        for i in range(count)
    ]


COURSES = [
    dict(key='course-1', title='Mathématiques Terminale Série C', subtitle='Analyse, probabilités et nombres complexes',
         description="Préparez l'épreuve de mathématiques du Baccalauréat série C avec un programme complet : étude de fonctions, suites, probabilités conditionnelles et nombres complexes, illustrés par des sujets d'examens officiels.",
         thumbnail='https://picsum.photos/seed/maths-c/600/400', gradient=('#6C5CE7', '#4432B0'),
         teacher='teacher-1', category='cat-1', price=2500, original_price=4500,
         level='Avancé', grade_tracks=['bac-c'], duration_hours=32,
         lessons=make_lessons(['Limites et continuité', 'Dérivabilité et étude de fonctions', 'Suites numériques', 'Intégrales et primitives', 'Probabilités conditionnelles', 'Nombres complexes', 'Révisions générales Bac'], 'maths-c'),
         pdfs=make_pdfs('Mathématiques Terminale C', 3),
         what_you_will_learn=["Maîtriser l'étude de fonctions et les limites", 'Résoudre des problèmes de probabilités conditionnelles', 'Manipuler les nombres complexes', 'Réussir l\'épreuve de mathématiques du Bac'],
         requirements=['Notions de Première Série C', 'Calculatrice scientifique'],
         language='Français', is_featured=True, is_bestseller=True),
    dict(key='course-2', title='Physique-Chimie Terminale D', subtitle='Mécanique, électricité et chimie organique',
         description="Ce cours couvre l'ensemble du programme de Physique-Chimie de Terminale D : mécanique du point, circuits électriques, chimie organique et cinétique chimique, avec correction de sujets types Bac.",
         thumbnail='https://picsum.photos/seed/physique-d/600/400', gradient=('#3D7FF7', '#2C63D6'),
         teacher='teacher-2', category='cat-2', price=2800, original_price=5500,
         level='Avancé', grade_tracks=['bac-d'], duration_hours=45,
         lessons=make_lessons(['Mécanique du point', 'Électricité et circuits', 'Chimie organique : les fonctions', 'Cinétique chimique', 'Ondes et phénomènes périodiques'], 'physique-d'),
         pdfs=make_pdfs('Physique-Chimie Terminale D', 4),
         what_you_will_learn=['Résoudre des exercices de mécanique du point', 'Comprendre les réactions de chimie organique', 'Analyser des circuits électriques', 'Réussir l\'épreuve de Physique-Chimie du Bac'],
         requirements=['Notions de Première Série D', 'Calculatrice scientifique'],
         language='Français', is_featured=True, is_bestseller=False),
    dict(key='course-3', title='Arabe & Lettres Originelles — Série O', subtitle='Grammaire, rhétorique et littérature classique',
         description="Maîtrisez la langue arabe classique et préparez l'épreuve de la série O : grammaire (Nahou), rhétorique (Balagha), analyse de textes littéraires et coraniques, méthodologie de la dissertation.",
         thumbnail='https://picsum.photos/seed/arabe-o/600/400', gradient=('#FF6B6B', '#E64A4A'),
         teacher='teacher-3', category='cat-4', price=1800, original_price=3200,
         level='Intermédiaire', grade_tracks=['bac-o'], duration_hours=18,
         lessons=make_lessons(['Grammaire arabe (Nahou)', 'Rhétorique (Balagha)', 'Littérature classique', 'Analyse de textes coraniques', 'Méthodologie de la dissertation en arabe'], 'arabe-o'),
         pdfs=make_pdfs('Arabe & Lettres Originelles', 2),
         what_you_will_learn=['Maîtriser les règles de grammaire arabe (Nahou)', 'Analyser des textes classiques', 'Rédiger une dissertation en arabe', 'Réussir l\'épreuve d\'arabe du Bac série O'],
         requirements=["Bon niveau d'arabe littéraire"],
         language='Arabe', is_featured=False, is_bestseller=True),
    dict(key='course-4', title='Mathématiques Brevet (BEPC)', subtitle='Le programme complet de 3ème',
         description='Ce cours vous prépare à l\'épreuve de mathématiques du Brevet : équations, théorèmes de géométrie, statistiques et probabilités, avec de nombreux exercices corrigés.',
         thumbnail='https://picsum.photos/seed/maths-brevet/600/400', gradient=('#00B894', '#00785C'),
         teacher='teacher-1', category='cat-1', price=1500, original_price=None,
         level='Débutant', grade_tracks=['brevet'], duration_hours=27,
         lessons=make_lessons(['Nombres relatifs et fractions', 'Équations et inéquations', 'Théorèmes de Pythagore et Thalès', "Géométrie dans l'espace", 'Statistiques et probabilités'], 'maths-brevet'),
         pdfs=make_pdfs('Mathématiques Brevet', 2),
         what_you_will_learn=['Résoudre équations et inéquations', 'Appliquer les théorèmes de Pythagore et Thalès', "Maîtriser la géométrie dans l'espace", 'Réussir l\'épreuve de mathématiques du Brevet'],
         requirements=['Programme de 4ème'],
         language='Français', is_featured=False, is_bestseller=False),
    dict(key='course-5', title="Préparation au Concours d'Entrée — ENA & Instituts Supérieurs", subtitle='Culture générale, méthodologie et entretien oral',
         description="Préparez efficacement les concours d'entrée aux grandes écoles mauritaniennes (ENA, ISCAE, instituts supérieurs) : culture générale, dissertation, tests de logique et simulation d'entretien oral.",
         thumbnail='https://picsum.photos/seed/concours-ena/600/400', gradient=('#FDCB6E', '#E8A93C'),
         teacher='teacher-4', category='cat-9', price=3500, original_price=6000,
         level='Avancé', grade_tracks=['concours'], duration_hours=14,
         lessons=make_lessons(['Culture générale et actualité', 'Méthodologie de la dissertation', 'Tests de logique et raisonnement', 'Entretien oral : simulation', "Cas pratiques Concours ENA"], 'concours-ena'),
         pdfs=make_pdfs('Concours ENA', 2),
         what_you_will_learn=['Construire une dissertation de culture générale', 'Réussir les tests psychotechniques', "Se préparer à l'entretien oral", "Connaître les grandes questions d'actualité mauritanienne et internationale"],
         requirements=['Niveau Baccalauréat'],
         language='Français', is_featured=False, is_bestseller=False),
    dict(key='course-6', title='Sciences de la Vie et de la Terre — Terminale D', subtitle='Génétique, écologie et immunologie',
         description="Approfondissez le programme de SVT de Terminale D : génétique et hérédité, dynamique des écosystèmes, immunologie et tectonique des plaques, avec des schémas et exercices type Bac.",
         thumbnail='https://picsum.photos/seed/svt-d/600/400', gradient=('#8A72F3', '#4432B0'),
         teacher='teacher-2', category='cat-3', price=3200, original_price=6200,
         level='Avancé', grade_tracks=['bac-d'], duration_hours=38,
         lessons=make_lessons(['Génétique et hérédité', 'Le brassage génétique', 'Écosystèmes et dynamique des populations', 'Immunologie', 'Géologie : tectonique des plaques'], 'svt-d'),
         pdfs=make_pdfs('SVT Terminale D', 3),
         what_you_will_learn=["Comprendre les mécanismes de l'hérédité", 'Analyser le fonctionnement des écosystèmes', 'Expliquer la réponse immunitaire', 'Réussir l\'épreuve de SVT du Bac'],
         requirements=['Notions de Première Série D'],
         language='Français', is_featured=True, is_bestseller=False),
    dict(key='course-7', title='Anglais — Préparation Baccalauréat', subtitle='Grammar, comprehension and essay writing',
         description='Ce cours renforce vos compétences en anglais pour le Bac : grammaire essentielle, compréhension écrite, rédaction structurée et expression orale.',
         thumbnail='https://picsum.photos/seed/anglais-bac/600/400', gradient=('#2C63D6', '#33257F'),
         teacher='teacher-4', category='cat-8', price=1600, original_price=None,
         level='Intermédiaire', grade_tracks=['bac-c', 'bac-d', 'bac-a', 'bac-o'], duration_hours=11,
         lessons=make_lessons(['Grammar essentials', 'Reading comprehension', 'Essay writing', 'Oral expression practice'], 'anglais-bac'),
         pdfs=make_pdfs('Anglais Bac', 1),
         what_you_will_learn=['Maîtriser la grammaire anglaise essentielle', 'Améliorer la compréhension écrite', 'Rédiger un essai structuré', "S'exprimer à l'oral avec aisance"],
         requirements=['Niveau intermédiaire en anglais'],
         language='Anglais', is_featured=False, is_bestseller=False),
    dict(key='course-8', title='Philosophie Terminale', subtitle='Méthodologie de la dissertation philosophique',
         description="Apprenez à construire une dissertation philosophique rigoureuse : conscience, liberté, l'État et la justice, avec une méthodologie pas à pas.",
         thumbnail='https://picsum.photos/seed/philo-terminale/600/400', gradient=('#FF6B6B', '#8A72F3'),
         teacher='teacher-3', category='cat-6', price=2000, original_price=3800,
         level='Intermédiaire', grade_tracks=['bac-c', 'bac-d', 'bac-a', 'bac-o'], duration_hours=16,
         lessons=make_lessons(['Introduction à la philosophie', "La conscience et l'inconscient", 'La liberté et le déterminisme', "L'État et la justice", 'Méthodologie : la dissertation philosophique'], 'philo-terminale'),
         pdfs=make_pdfs('Philosophie Terminale', 2),
         what_you_will_learn=['Construire une dissertation philosophique', 'Analyser un texte philosophique', 'Maîtriser les notions de conscience et de liberté', "Réussir l'épreuve de philosophie du Bac"],
         requirements=['Niveau Terminale'],
         language='Français', is_featured=False, is_bestseller=False),
    dict(key='course-9', title='Histoire-Géographie — Bac & Brevet', subtitle="L'histoire de la Mauritanie et la géographie du Sahel",
         description="Un cours complet d'Histoire-Géographie couvrant l'histoire précoloniale et coloniale de la Mauritanie, ainsi que la géographie physique et économique du Sahel.",
         thumbnail='https://picsum.photos/seed/histoire-geo/600/400', gradient=('#5642D6', '#221A54'),
         teacher='teacher-4', category='cat-7', price=1700, original_price=None,
         level='Intermédiaire', grade_tracks=['bac-c', 'bac-d', 'bac-a', 'bac-o', 'brevet'], duration_hours=9,
         lessons=make_lessons(['Histoire de la Mauritanie précoloniale', "La colonisation et l'indépendance", 'Géographie physique de la Mauritanie', 'Géographie économique et enjeux du Sahel'], 'histoire-geo'),
         pdfs=make_pdfs('Histoire-Géographie', 1),
         what_you_will_learn=["Connaître l'histoire de la Mauritanie", 'Analyser les enjeux géographiques du Sahel', 'Maîtriser la méthodologie de la composition', "Réussir l'épreuve d'Histoire-Géographie"],
         requirements=['Programme Bac ou Brevet'],
         language='Français', is_featured=False, is_bestseller=True),
]

REVIEWS = [
    dict(course='course-1', student='student-1', rating=5, comment="Excellent cours, les explications sur les probabilités m'ont beaucoup aidée pour le Bac blanc !"),
    dict(course='course-1', student='student-9', rating=5, comment='Le meilleur professeur de mathématiques que j\'ai eu, tout est clair et bien expliqué.'),
    dict(course='course-1', student='student-10', rating=4, comment="Très bon contenu, j'aurais aimé plus d'exercices corrigés."),
    dict(course='course-2', student='student-2', rating=5, comment='Grâce à ce cours j\'ai enfin compris la mécanique, merci professeure !'),
    dict(course='course-2', student='student-11', rating=5, comment='Parfait pour réviser avant le Bac, exercices très proches du sujet réel.'),
    dict(course='course-3', student='student-1', rating=4, comment='Cours très riche sur la Balagha, vraiment utile pour la série O.'),
    dict(course='course-5', student='student-3', rating=5, comment="La simulation d'entretien oral était incroyablement réaliste."),
    dict(course='course-9', student='student-9', rating=5, comment="J'ai enfin compris l'histoire précoloniale de la Mauritanie grâce à ce cours."),
]

ENROLLMENTS = [
    ('student-1', 'course-1', 0.62), ('student-1', 'course-3', 0.3), ('student-1', 'course-5', 0.9),
    ('student-2', 'course-2', 0.15), ('student-2', 'course-6', 0.0),
    ('student-3', 'course-5', 1.0), ('student-3', 'course-7', 0.4),
]

FAVORITES = [('student-1', 'course-2'), ('student-1', 'course-9'), ('student-2', 'course-1')]

PAYMENTS = [
    dict(course='course-1', student='student-1', amount=2500, method='Bankily', status='Réussi'),
    dict(course='course-1', student='student-4', amount=2500, method='Masrvi', status='Réussi'),
    dict(course='course-4', student='student-5', amount=1500, method='Click', status='Réussi'),
    dict(course='course-9', student='student-1', amount=1700, method='Bankily', status='Réussi'),
    dict(course='course-1', student='student-6', amount=2500, method='Sedad', status='En attente'),
    dict(course='course-4', student='student-7', amount=1500, method='Masrvi', status='Réussi'),
    dict(course='course-9', student='student-8', amount=1700, method='Sedad', status='Échoué'),
]

LIVE_SESSIONS = [
    dict(key='live-1', title='Séance de Questions/Réponses : Réussir l\'épreuve de Maths au Bac',
         description='Posez toutes vos questions sur le programme de mathématiques Terminale C et la méthodologie du jour du Bac.',
         teacher='teacher-1', course='course-1', category_name='Mathématiques',
         scheduled_at='2026-09-02T18:00:00Z', duration_minutes=60, status='live', viewers_count=342,
         thumbnail='https://picsum.photos/seed/live-maths/600/400', gradient=('#6C5CE7', '#4432B0')),
    dict(key='live-2', title='Atelier pratique : Résoudre les exercices de Mécanique',
         description='Nous résoudrons ensemble des exercices de mécanique du point type Bac, en direct.',
         teacher='teacher-2', course='course-2', category_name='Physique-Chimie',
         scheduled_at='2026-09-04T17:00:00Z', duration_minutes=90, status='upcoming', viewers_count=0,
         thumbnail='https://picsum.photos/seed/live-physique/600/400', gradient=('#3D7FF7', '#2C63D6')),
    dict(key='live-3', title='Correction en direct : Sujets de Lettres Originelles',
         description='Correction commentée de sujets d\'examens de la série O, questions en direct.',
         teacher='teacher-3', course='course-3', category_name='Arabe & Lettres Originelles',
         scheduled_at='2026-09-06T19:30:00Z', duration_minutes=45, status='upcoming', viewers_count=0,
         thumbnail='https://picsum.photos/seed/live-arabe/600/400', gradient=('#FF6B6B', '#E64A4A')),
    dict(key='live-4', title="Simulation d'entretien oral — Concours ENA",
         description="Observez une simulation complète d'entretien oral pour le concours d'entrée à l'ENA.",
         teacher='teacher-4', course='course-5', category_name='Concours',
         scheduled_at='2026-08-28T18:00:00Z', duration_minutes=60, status='ended', viewers_count=890,
         thumbnail='https://picsum.photos/seed/live-concours/600/400', gradient=('#FDCB6E', '#E8A93C')),
]

LIVE_CHAT = [
    ('live-1', 'teacher-1', 'Bienvenue à toutes et tous ! On commence dans 1 minute 🎉'),
    ('live-1', 'student-1', 'Hâte de voir ça, merci pour la session !'),
    ('live-1', 'student-9', 'Est-ce que la session sera enregistrée ?'),
    ('live-1', 'teacher-1', 'Oui, elle sera disponible en replay dans le cours 👍'),
    ('live-1', 'student-10', "Super, j'ai justement une question sur les probabilités conditionnelles"),
    ('live-1', 'student-6', 'Le son est parfait 🔊'),
]


class Command(BaseCommand):
    help = 'Seeds the database with demo data equivalent to the frontend mock data (idempotent).'

    @transaction.atomic
    def handle(self, *args, **options):
        categories = self._seed_categories()
        teachers = self._seed_users(TEACHERS, User.Role.TEACHER)
        students = self._seed_users(STUDENTS, User.Role.STUDENT)
        courses = self._seed_courses(categories, teachers)
        self._seed_reviews(courses, students)
        self._seed_enrollments(courses, students)
        self._seed_favorites(courses, students)
        self._seed_payments(courses, students)
        self._seed_live(courses, teachers, students)

        self.stdout.write(self.style.SUCCESS(
            f'Seed termine : {len(categories)} categories, {len(teachers)} profs, '
            f'{len(students)} etudiants, {len(courses)} cours. Mot de passe demo : "{DEMO_PASSWORD}"'
        ))

    def _seed_categories(self):
        result = {}
        for key, name, icon, color in CATEGORIES:
            obj, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon, 'color': color})
            result[key] = obj
        return result

    def _seed_users(self, entries, role):
        result = {}
        for entry in entries:
            defaults = {
                'full_name': entry['fullName'],
                'avatar': entry['avatar'],
                'role': role,
                'bio': entry.get('bio', ''),
            }
            if role == User.Role.TEACHER:
                defaults['headline'] = entry.get('headline', '')
                defaults['specialties'] = entry.get('specialties', [])
            user, created = User.objects.get_or_create(email=entry['email'], defaults=defaults)
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save()
            result[entry['key']] = user
        return result

    def _seed_courses(self, categories, teachers):
        result = {}
        for entry in COURSES:
            course, created = Course.objects.get_or_create(
                title=entry['title'],
                teacher=teachers[entry['teacher']],
                defaults=dict(
                    subtitle=entry['subtitle'], description=entry['description'], thumbnail=entry['thumbnail'],
                    cover_gradient_start=entry['gradient'][0], cover_gradient_end=entry['gradient'][1],
                    category=categories[entry['category']], price=entry['price'], original_price=entry['original_price'],
                    level=entry['level'], grade_tracks=entry['grade_tracks'], language=entry['language'], duration_hours=entry['duration_hours'],
                    what_you_will_learn=entry['what_you_will_learn'], requirements=entry['requirements'],
                    is_featured=entry['is_featured'], is_bestseller=entry['is_bestseller'],
                ),
            )
            if not created and course.grade_tracks != entry['grade_tracks']:
                course.grade_tracks = entry['grade_tracks']
                course.save(update_fields=['grade_tracks'])
            if created:
                Lesson.objects.bulk_create([Lesson(course=course, **l) for l in entry['lessons']])
                CoursePdf.objects.bulk_create([CoursePdf(course=course, **p) for p in entry['pdfs']])
            result[entry['key']] = course
        return result

    def _seed_reviews(self, courses, students):
        for r in REVIEWS:
            Review.objects.get_or_create(
                course=courses[r['course']], student=students[r['student']],
                defaults={'rating': r['rating'], 'comment': r['comment']},
            )

    def _seed_enrollments(self, courses, students):
        for student_key, course_key, progress in ENROLLMENTS:
            enrollment, created = Enrollment.objects.get_or_create(
                student=students[student_key], course=courses[course_key], defaults={'progress': progress},
            )
            if created:
                course = courses[course_key]
                course.students_count += 1
                course.save(update_fields=['students_count'])

    def _seed_favorites(self, courses, students):
        for student_key, course_key in FAVORITES:
            Favorite.objects.get_or_create(student=students[student_key], course=courses[course_key])

    def _seed_payments(self, courses, students):
        if Payment.objects.exists():
            return
        Payment.objects.bulk_create([
            Payment(course=courses[p['course']], student=students[p['student']], amount=p['amount'],
                    method=p['method'], status=p['status'])
            for p in PAYMENTS
        ])
        # A successful payment always grants access — keep Enrollment consistent with Payment,
        # exactly like the real checkout flow (commerce.views.CartItemViewSet.checkout) does.
        for p in PAYMENTS:
            if p['status'] != 'Réussi':
                continue
            course = courses[p['course']]
            _, created = Enrollment.objects.get_or_create(student=students[p['student']], course=course)
            if created:
                course.students_count += 1
                course.save(update_fields=['students_count'])

    def _seed_live(self, courses, teachers, students):
        live_map = {}
        for entry in LIVE_SESSIONS:
            live, _ = LiveSession.objects.get_or_create(
                title=entry['title'],
                defaults=dict(
                    description=entry['description'], teacher=teachers[entry['teacher']],
                    course=courses.get(entry['course']), category_name=entry['category_name'],
                    scheduled_at=entry['scheduled_at'], duration_minutes=entry['duration_minutes'],
                    status=entry['status'], viewers_count=entry['viewers_count'], thumbnail=entry['thumbnail'],
                    cover_gradient_start=entry['gradient'][0], cover_gradient_end=entry['gradient'][1],
                ),
            )
            live_map[entry['key']] = live

        if LiveChatMessage.objects.exists():
            return
        people = {**teachers, **students}
        LiveChatMessage.objects.bulk_create([
            LiveChatMessage(live_session=live_map[live_key], user=people[person_key], message=message)
            for live_key, person_key, message in LIVE_CHAT
        ])
