# GEMINI.md - Project Overview & Instructions

## Project Overview
This project is a microservices-based management platform (PFE) comprising multiple frontend applications and backend services. It facilitates project management, team collaboration, real-time communication, and billing.

### Core Technologies
- **Frontend (Client):** Next.js 15 (App Router), Tailwind CSS, Redux Toolkit, Socket.io, Stripe.
- **Frontend (Dashboard):** Vite + React, Tailwind CSS, Chart.js.
- **Backend Services:**
  - **User Service:** Spring Boot (Java 17), MySQL.
  - **Project Service:** Laravel (PHP 8.1+), MySQL.
  - **Billing Service:** Laravel (PHP 8.1+), MySQL.
  - **Task Service:** Node.js (Express), MongoDB.
  - **Chat Service:** Node.js (Express), MongoDB, Socket.io.
  - **Notification Service:** Node.js (Express), MongoDB, Socket.io.
- **Infrastructure:** Docker, RabbitMQ (for inter-service communication).

---

## Directory Structure & Ports

| Directory | Purpose | Tech Stack | Port (Default) |
|-----------|---------|------------|----------------|
| `/client` | Main User Application | Next.js | 3000 |
| `/dashboard` | Admin Dashboard | Vite/React | 5173 |
| `/services/UserService` | User & Auth Management | Spring Boot | 1010 |
| `/services/ProjectService` | Project & Team Management | Laravel | 8000 |
| `/services/BillingService` | Payments & Subscriptions | Laravel | 6060 |
| `/services/TaskService` | Task & Attachment Management | Node.js | 3000* |
| `/services/ChatService` | Real-time Chat | Node.js | 4000 |
| `/services/NotificationService` | Real-time Notifications | Node.js | 5050 |

*\*Note: Port 3000 is shared by Client and TaskService default configurations; adjustments may be needed for local concurrent runs.*

---

## Building and Running

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- PHP (v8.1+) & Composer
- Java (v17) & Maven

### Running Services with Docker
Most services include a `Dockerfile` and `docker-compose.yml`. Navigate to the service directory and run:
```bash
docker-compose up -d
```

### Manual Development Setup

#### Frontend (Client/Dashboard)
```bash
cd client # or cd dashboard
npm install
npm run dev
```

#### Node.js Services (Task/Chat/Notification)
```bash
cd services/TaskService
npm install
npm run dev
```

#### Laravel Services (Project/Billing)
```bash
cd services/ProjectService
composer install
php artisan migrate
php artisan serve --port=XXXX
```

#### Spring Boot (UserService)
```bash
cd services/UserService
./mvnw spring-boot:run
```

---

## Development Conventions

### General Guidelines
- **API Standards:** Follow RESTful principles. Most services use a `verify.token` middleware or equivalent for security.
- **Styling:** Use Tailwind CSS for all frontend components. Adhere to the design patterns established in `client/components/ui`.
- **State Management:** Use Redux Toolkit in the Next.js `client` application.
- **Real-time:** Socket.io is used for Chat and Notifications. Ensure CORS configurations in services allow the client origin.

### Environment Variables
Each service expects a `.env` file based on provided `.env.example` or equivalent configuration files. Key variables usually include:
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` (Ensure consistency across services for token verification)
- `MONGO_URI` (for Node services)
- `RABBITMQ_URL` (for inter-service messaging)

### Testing
- **PHP:** Use `php artisan test` or `phpunit`.
- **Node.js:** Check for `jest` or `mocha` (to be implemented if missing).
- **Java:** Use `./mvnw test`.
