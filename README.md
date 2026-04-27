# Kanban Board Frontend

This is the frontend application for the Kanban Board, built with a modern React stack. It provides a highly interactive and responsive interface for managing tasks across different columns.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** TanStack Router (`@tanstack/react-router`)
- **State Management:** Zustand
- **Styling:** Tailwind CSS + `tw-animate-css`
- **UI Components:** Radix UI Primitives, Lucide React (Icons)
- **Forms & Validation:** React Hook Form + Zod
- **Mock Backend:** JSON Server (`json-server`)
- **Authentication:** Firebase (Google, Apple, etc.)
- **Testing:** Vitest, Playwright (Browser testing)

## Prerequisites

- Node.js (v18 or higher recommended)
- `npm`, `yarn`, `pnpm`, or `bun`

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example` in the root of the `frontend` directory and fill in the necessary environment variables, primarily for Firebase authentication configuration.

```bash
cp .env.example .env
```

### 3. Start the Mock Backend (JSON Server)

The application uses `json-server` to mock a backend API. This must be running for the application to fetch and save data.

```bash
npm run server
```

By default, this will run on `http://localhost:8000` and watch `db.json`.

### 4. Start the Development Server

In a new terminal window, start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run server`: Starts the JSON Server on port 8000.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run format`: Formats code using Prettier.
- `npm run format:check`: Checks if code is formatted properly.
- `npm run test`: Runs unit tests using Vitest (headless browser).
- `npm run test:ui`: Runs Vitest with UI interface.
- `npm run test:browser:install`: Installs Playwright browsers for testing.

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/              # Application source code
│   ├── components/   # Reusable UI components (buttons, dialogs, etc.)
│   ├── features/     # Feature-based modules (task-management, etc.)
│   ├── routes/       # Route definitions for TanStack Router
│   ├── store/        # Zustand state stores
│   ├── utils/        # Utility functions
│   └── ...
├── .env.example      # Example environment variables file
├── db.json           # JSON Server database file
├── package.json      # Project dependencies and scripts
└── vite.config.ts    # Vite configuration
```

## Features

- **Drag and Drop Kanban Board:** Easily move tasks between different statuses.
- **Task Management:** Create, edit, and delete tasks.
- **Authentication:** Secure sign-up and login flow powered by Firebase.
- **Responsive Design:** Works seamlessly across desktop and mobile devices.
- **Dark Mode Support:** Built-in theming capabilities.
