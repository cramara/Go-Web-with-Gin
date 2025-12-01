# Frontend React - Album Management

React application to manage albums via the Go/Gin API.

## Installation

```bash
npm install
```

## Starting

```bash
npm run dev
```

The application will be accessible at http://localhost:3000

## Structure

- `src/components/` - React components
  - `Login.jsx` - Login page
  - `Register.jsx` - Registration page
  - `AlbumsList.jsx` - Albums list
  - `AlbumDetail.jsx` - Album details
  - `CreateAlbum.jsx` - Album creation
  - `Header.jsx` - Header with navigation
  - `ProtectedRoute.jsx` - Route protected by authentication

- `src/context/` - React contexts
  - `AuthContext.jsx` - Authentication management

- `src/services/` - API services
  - `api.js` - Axios configuration and API calls

## Features

- Authentication (login/register)
- Albums list with tags and creator
- Album details
- Album creation with optional tags
- Route protection by authentication
- Automatic JWT token management

## API Configuration

The backend API must be started on `http://localhost:8082`

To change the API URL, modify `API_URL` in `src/services/api.js`

