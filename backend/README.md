# EduConnect — Backend (Django + DRF + PostgreSQL)

API REST pour l'application EduConnect. Reproduit exactement les types TypeScript du front (`src/types/index.ts`) : `Course`, `Student`, `Teacher`, `Payment`, `LiveSession`, etc. — les clés JSON sont en camelCase pour être consommées telles quelles côté React Native.

## Démarrer avec Docker (recommandé)

Depuis la racine du projet (pas `backend/`) :

```bash
docker compose up -d --build
```

Cela lance :
- **db** : PostgreSQL 16 sur `localhost:5433` (volume persistant `postgres_data`)
- **backend** : API Django sur `http://localhost:8001`, avec migrations + seed de données de démo appliqués automatiquement au démarrage

L'API est alors accessible sur `http://localhost:8001/api/`, l'admin Django sur `http://localhost:8001/admin/`.

Pour arrêter : `docker compose down` (ajoutez `-v` pour aussi supprimer les données Postgres).

## Comptes de démo (mot de passe : `password123`)

- Étudiante : `mariem.abdellahi@gmail.com`
- Professeur : `mohamed.sidiahmed@educonnect.mr`

(Voir `catalog/management/commands/seed_demo_data.py` pour la liste complète.)

## Développement sans Docker

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # ou source .venv/bin/activate sur macOS/Linux
pip install -r requirements.txt
cp .env.example .env          # puis ajustez DATABASE_URL vers votre Postgres local
python manage.py migrate
python manage.py seed_demo_data
python manage.py createsuperuser   # optionnel, pour /admin/
python manage.py runserver
```

## Endpoints principaux

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/auth/register/` | Inscription (`fullName`, `email`, `password`, `role`) |
| POST | `/api/auth/login/` | Connexion → `{ access, refresh, user }` |
| POST | `/api/auth/refresh/` | Rafraîchit le token d'accès |
| GET/PATCH | `/api/auth/me/` | Profil de l'utilisateur connecté |
| GET | `/api/categories/` | Liste des catégories |
| GET/POST | `/api/courses/` | Liste (filtrable : `category`, `teacher`, `level`, `minPrice`, `maxPrice`, `featured`, `bestseller`, `search`) / création (prof) |
| GET/PATCH/DELETE | `/api/courses/{id}/` | Détail / modification / suppression (propriétaire uniquement) |
| GET/POST | `/api/courses/{id}/lessons/` | Leçons d'un cours |
| GET/POST | `/api/courses/{id}/pdfs/` | Supports PDF d'un cours |
| GET/POST | `/api/courses/{id}/reviews/` | Avis d'un cours |
| GET/POST/DELETE | `/api/favorites/` | Favoris de l'étudiant connecté |
| GET/POST/DELETE | `/api/cart/` | Panier de l'étudiant connecté |
| POST | `/api/cart/checkout/` | Transforme le panier en achats (`Enrollment` + `Payment`), vide le panier |
| GET | `/api/enrollments/` | Cours achetés par l'étudiant + `progress` |
| PATCH | `/api/enrollments/{id}/progress/` | Met à jour la progression (0–1) |
| GET | `/api/payments/` | Paiements de l'étudiant, ou revenus du prof (selon le rôle) |
| GET/POST | `/api/live/` | Sessions live |
| GET/POST | `/api/live/{id}/chat/` | Messages du chat d'une session live |

Auth : header `Authorization: Bearer <access_token>` sur toutes les routes protégées.

## Architecture

```
backend/
  config/       Settings, URLs racine, WSGI/ASGI
  accounts/     User custom (email + rôle student/teacher), JWT auth, permissions
  catalog/      Category, Course, Lesson, CoursePdf, Review + seed de démo
  commerce/     Favorite, CartItem, Enrollment, Payment (logique d'achat)
  live/         LiveSession, LiveChatMessage
```

Points clés :
- `Course.rating` / `ratingCount` sont recalculés automatiquement via un signal Django à chaque création/suppression de `Review` (`catalog/signals.py`).
- Les stats du prof (`totalStudents`, `totalRevenue`, `rating`) sont calculées dynamiquement à partir des `Enrollment`/`Payment`/`Course` liés — pas de duplication de données.
- Tous les identifiants sont des UUID (correspond au type `id: string` du front).
