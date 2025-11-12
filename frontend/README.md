# Frontend React - Gestion d'Albums

Application React pour gérer les albums via l'API Go/Gin.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Structure

- `src/components/` - Composants React
  - `Login.jsx` - Page de connexion
  - `Register.jsx` - Page d'inscription
  - `AlbumsList.jsx` - Liste des albums
  - `AlbumDetail.jsx` - Détails d'un album
  - `CreateAlbum.jsx` - Création d'un album
  - `Header.jsx` - En-tête avec navigation
  - `ProtectedRoute.jsx` - Route protégée par authentification

- `src/context/` - Contextes React
  - `AuthContext.jsx` - Gestion de l'authentification

- `src/services/` - Services API
  - `api.js` - Configuration axios et appels API

## Fonctionnalités

- Authentification (login/register)
- Liste des albums avec tags et créateur
- Détails d'un album
- Création d'albums avec tags optionnels
- Protection des routes par authentification
- Gestion automatique des tokens JWT

## Configuration API

L'API backend doit être démarrée sur `http://localhost:8082`

Pour changer l'URL de l'API, modifiez `API_URL` dans `src/services/api.js`

