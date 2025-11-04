# DisKnee

A comprehensive physiotherapy application designed to help patients track their knee rehabilitation exercises and monitor their progress through interactive sessions and real-time feedback.

## Features

- **Exercise Tracking**: Track various knee rehabilitation exercises with video guidance
- **Session Management**: Monitor exercise sessions with duration, accuracy, and completion metrics
- **Real-time Pose Detection**: Python-powered pose analysis for exercise form validation
- **Progress Analytics**: Visual charts and statistics for rehabilitation progress
- **Leaderboard**: Competitive element to motivate patients through gamification
- **Reflections**: Journal-style notes for mental and physical progress tracking
- **Telehealth Appointments**: Schedule and manage virtual consultations
- **Shop**: Purchase rehabilitation equipment and accessories

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.11+ (for pose detection features)
- npm

## Getting Started

### 1. Clone the Repository

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/disknee"

# Auth
BETTER_AUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Other environment variables as needed
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npm run db:seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
DisKnee/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (authenticated)/   # Protected app pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── actions/           # Server actions
│   ├── handlers/          # Request handlers
│   └── validations/       # Zod schemas
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Authentication

The application uses Better Auth for authentication. Users can:

- Log in to access personalized features using the demo@disknee.com email and demo123 password
- Maintain secure sessions across the app
