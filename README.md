# EduConnect

Application mobile de formation en ligne (front-end uniquement) construite avec **React Native + Expo + TypeScript**. Toutes les données sont simulées (mock data) — aucun backend n'est requis pour lancer et utiliser l'application.

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

## Connexion à un futur backend

Le code est structuré pour être facilement branché à une API réelle (ex. Django + PostgreSQL) :
- `src/data/*` peut être remplacé par des appels API sans changer les écrans (mêmes formes de types dans `src/types`).
- `src/context/*` centralise déjà la logique métier (auth, panier, favoris, achats, CRUD cours) — il suffit d'y substituer les mutations locales par des requêtes réseau.
