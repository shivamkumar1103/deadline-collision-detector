 # Deadline Collision Detector

Deadline Collision Detector is a student task planner that helps track assignments, exams, labs, and vivas while highlighting deadline collisions. The app combines a React + Vite frontend with an Express + MySQL backend and Clerk-based authentication.

## Features

- Create, edit, and delete tasks.
- Organize work by subject and category.
- Detect deadline collisions between tasks.
- Sync authenticated users through Clerk.
- View a dashboard with task statistics and alerts.
- Toggle between light and dark themes.

## Tech Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Motion, Lucide React
- Backend: Node.js, Express, TypeScript
- Database: MySQL
- Authentication: Clerk

## Project Structure

- `src/` contains the React UI, pages, components, and shared types.
- `server.ts` starts the Express server and mounts the API routes.
- `routes/`, `controllers/`, `models/`, and `config/` contain the backend MVC layers.
- `schema.sql` includes the database schema and sample seed data.

## Prerequisites

- Node.js 18 or newer
- MySQL 8 or compatible
- A Clerk application if you want authentication enabled

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env.local` file in the project root and configure your database credentials:

	```env
	DB_HOST=localhost
	DB_PORT=3306
	DB_USER=root
	DB_PASSWORD=your_password
	DB_NAME=deadline_db
	```

3. Create the database schema:

	```sql
	source schema.sql
	```

	The server also creates the required tables automatically when it connects to MySQL, but the schema file is useful for first-time setup and sample data.

4. Start the development server:

	```bash
	npm run dev
	```

5. Open the app in your browser at:

	```text
	http://localhost:3000
	```

## Available Scripts

- `npm run dev` starts the Express server and Vite middleware in development.
- `npm run build` builds the frontend for production.
- `npm run preview` previews the production build.
- `npm run lint` runs TypeScript type checking.
- `npm run clean` removes the `dist/` directory.

## API Endpoints

The backend exposes the following endpoints:

- `GET /api/health` returns a basic health check.
- `GET /api/tasks` lists tasks.
- `POST /api/tasks` creates a task.
- `PUT /api/tasks/:id` updates a task.
- `DELETE /api/tasks/:id` deletes a task.
- `GET /api/tasks/detect-clashes` returns detected deadline collisions.
- `GET /api/subjects` lists subjects.
- `POST /api/subjects` creates a subject.
- `DELETE /api/subjects/:id` deletes a subject.
- `POST /api/users/sync` syncs a Clerk user into the database.

## Database Notes

- The app expects a `users`, `subjects`, `tasks`, and `collision_alerts` table.
- The backend initializes missing tables on startup through the MySQL pool configuration.
- Task collision detection currently flags tasks whose deadlines are the same or within one day of each other.

## Troubleshooting

- If the UI loads but data does not appear, confirm MySQL is running and the `.env.local` values are correct.
- If authentication fails, verify your Clerk configuration in the frontend environment.
- If ports conflict, ensure nothing else is running on port `3000`.


