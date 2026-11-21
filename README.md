# Générations du Futur

Application mobile de formation en ligne construite avec **React Native + Expo + TypeScript**, avec un backend **Django REST Framework + PostgreSQL** dans [`backend/`](backend/README.md).

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

Les boutons **Admin** et **Directeur** ouvrent l'espace de gestion (mot de passe `password123`) :

| Rôle | Email | Accès |
|---|---|---|
| Directeur général | `directeur@generations.mr` | Tout : comptes, filières/classes, trimestres, % des profs, WhatsApp et limites de vues |
| Administrateur | `admin@generations.mr` | Valider les paiements WhatsApp, fermer les packs d'un prof, promos gratuites |

### Règles métier

- **Classes** du primaire (1AF→6AF) au collège (1AS→Brevet), lycée (5AS, 6AS, 7C, 7D, 7LM, 7LO) et concours — la 7T a été retirée. Le directeur peut en ajouter.
- **4 façons d'acheter** : pack complet de la classe (-20 %), matières principales (-10 %), matières secondaires (-10 %), ou tous les cours d'un professeur (-10 %).
- **Trimestres** : chaque cours appartient à un trimestre et se débloque à sa date de début.
- **Protection** : captures d'écran bloquées dans le lecteur ; 4 visionnages max par leçon (2 avec l'offre « un professeur ») — réglable par le directeur.
- **Paiement** : l'élève envoie le montant au numéro marchand (Bankily, Masrvi, Sedad, Click), puis la capture sur WhatsApp avec sa référence ; un admin valide et les cours s'activent.

## Architecture

```
src/
  theme/        Couleurs, typographie, espacements, contexte clair/sombre
  types/        Types TypeScript métier (Course, User, Payment, Live...)
  api/          Appels à l'API Django (catalogue, achats, espace admin/directeur)
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

L'application mobile est branchée sur cette API (voir `src/api/config.ts` pour l'adresse du serveur).
