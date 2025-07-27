# Learn Project

A full-stack JavaScript application with a React frontend and a Node.js (Bun-compatible) backend. Styled with Tailwind CSS.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Frontend](#frontend)
- [Backend](#backend)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [License](#license)

---

## Features

- React frontend (in `src/`)
- Node.js backend (in `backend/`)
- Tailwind CSS for styling
- Algolia integration (planned or in progress)
- Easy local development

## Project Structure

```
learn/
  backend/           # Backend server code (Node.js/Bun)
  public/            # Static assets for frontend
  src/               # React frontend source code
    components/      # React components
  tailwind.config.js # Tailwind CSS configuration
  postcss.config.js  # PostCSS configuration
  package.json       # Project dependencies and scripts
  tsconfig.json      # TypeScript configuration (if used)
  .env               # Environment variables (not committed)
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or Bun (for backend)
- (Optional) Bun for backend: [Get Bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd learn
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or, if using Bun for backend:
   cd backend
   bun install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required values.

### Running the Project

#### Start the Frontend

```sh
npm start
```
- The app will be available at [http://localhost:3000](http://localhost:3000).

#### Start the Backend

```sh
cd backend
node server.js
# or, if using Bun:
bun run server.js
```
- The backend will run on [http://localhost:3001](http://localhost:3001).

---

## Frontend

- React frontend (in `src/`)
- Tailwind CSS for styling
- Easy local development

## Backend

- Node.js backend (in `backend/`)
- Tailwind CSS for styling
- Easy local development

## Environment Variables

- `REACT_APP_API_URL`: URL for the frontend to communicate with the backend.
- `REACT_APP_ALGOLIA_APP_ID`: Algolia application ID (if used).
- `REACT_APP_ALGOLIA_SEARCH_API_KEY`: Algolia search API key (if used).
- `REACT_APP_ALGOLIA_ADMIN_API_KEY`: Algolia admin API key (if used).
- `PORT`: Port for the backend server (default: 3001).

## Testing

- Frontend: `npm test`
- Backend: `cd backend && bun test`

## License

MIT License

---

You can further customize this README with more details about your project, usage instructions, or contribution guidelines as needed. If you want this written to your `README.md`, let me know!

**Happy coding!**
