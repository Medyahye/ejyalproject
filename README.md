# Générations du Futur

Application mobile de formation en ligne construite avec **React Native + Expo + TypeScript**, avec un backend **Django REST Framework + PostgreSQL** dans [`backend/`](backend/README.md). Le front peut aussi tourner seul avec les données simulées (mock data) — voir ci-dessous.

## Lancer le projet

```bash
npm install
npm run start   # puis appuyez sur "w" pour le web, "a" pour Android, "i" pour iOS
```

Ou directement :

```bash
npm run web
npm run android
npm run ios
```

## Comptes de démonstration

Sur l'écran de connexion, utilisez les boutons **"Continuer comme étudiant"** ou **"Continuer comme professeur"** pour vous connecter instantanément avec un compte pré-rempli de données fictives (cours, avis, paiements, sessions live...).

## Architecture

```
src/
  theme/        Couleurs, typographie, espacements, contexte clair/sombre
  types/        Types TypeScript métier (Course, User, Payment, Live...)
  data/         Données mockées (cours, professeurs, étudiants, avis, paiements, lives)
  context/      État global (Auth, données étudiant, données professeur)
  components/   Composants réutilisables (ui/, course/, layout/)
  navigation/   Auth Stack, Student Tabs + Stack, Teacher Drawer + Stack
  screens/      Écrans par domaine (auth/, student/, teacher/, live/)
  utils/        Fonctions de formatage (prix, dates, durées...)
```

- **Étudiant** : Home, Explorer, Recherche, Détail cours, Lecteur vidéo (simulé), Bibliothèque PDF, Panier, Paiement (simulé), Mes cours, Favoris, Profil, Paramètres.
- **Professeur** : Dashboard, Mes cours (CRUD), Ajouter/Modifier un cours, Statistiques, Revenus, Étudiants inscrits, Profil — via un Drawer personnalisé.
- **Live** : Liste des lives, salle de live (avec chat intégré), planification d'un live — interface uniquement, aucun flux vidéo réel.

## Backend (Django + PostgreSQL)

Un backend complet vit dans [`backend/`](backend/README.md) et expose une API REST dont les réponses JSON correspondent exactement aux types de `src/types/index.ts` (mêmes clés camelCase). Pour le lancer :

```bash
docker compose up -d --build
```

Voir [`backend/README.md`](backend/README.md) pour la liste des endpoints, les comptes de démo, et le lancement sans Docker.

`src/data/*` et `src/context/*` peuvent être branchés sur cette API en substituant les mutations locales par des appels réseau (fetch/axios) vers `http://localhost:8001/api/...` — les formes de données sont déjà identiques, aucun changement d'écran n'est nécessaire.
