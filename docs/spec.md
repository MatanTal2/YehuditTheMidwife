# Technical Specification

## Overview
Yehudit-the-Midwife is a web application providing stage-based pregnancy information and tools for users in Israel.

## Tech Stack

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- State Management: Context API / Zustand
- React Hook Form

### Backend
- Firebase Platform
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions

### DevOps
- Git (GitHub)
  - Branching: main (production), dev (development)
- GitHub Actions (CI/CD)
- Testing:
  - Jest (Unit)
  - Playwright/Cypress (E2E)

### Hosting
- Firebase Hosting

## Database Schema

### Users Collection
```json
{
  "uid": "string",
  "email": "string",
  "createdAt": "Timestamp",
  "dueDate": "Date",
  "savedArticles": ["string"],
  "checklistItems": [
    {
      "id": "string",
      "content": "string",
      "completed": true
    }
  ]
}
```

### Articles Collection
```json
{
  "id": "string",
  "title": "string",
  "body": "string",
  "weekRange": [1, 2, 3],
  "tags": ["string"],
  "createdAt": "Timestamp"
}
```

## Security & Compliance
- Firebase Rules for authentication-based access
- Minimal PII collection
- HTTPS enforcement
- Israeli healthcare content verification compliance 