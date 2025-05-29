
# Yehudit-the-Midwife – Full Technical Specification

## 1. Overview
**Yehudit-the-Midwife** is a web application designed to provide comprehensive, stage-based pregnancy-related information and tools for users in Israel. It includes three stages:
- Before Pregnancy (future)
- During Pregnancy (MVP focus)
- After Birth up to One Year (future)

Users can optionally register for personalized features.

---

## 2. Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Context API / Zustand (to be confirmed)
- **Forms:** React Hook Form

### Backend
- **Platform:** Firebase
  - **Auth:** Firebase Authentication (email/password)
  - **Database:** Firebase Firestore
  - **Storage:** Firebase Cloud Storage (optional for images/docs)
  - **Functions:** Firebase Cloud Functions (future scalability)

### DevOps
- **Version Control:** Git (GitHub)
  - Branching: `main` (production), `dev` (development)
- **CI/CD:** GitHub Actions (CI + deploy to Firebase Hosting)
- **Testing:**
  - Unit: Jest
  - E2E: Playwright or Cypress (TBD)

### Hosting
- **Hosting Platform:** Firebase Hosting

---

## 3. Core Features (MVP: During Pregnancy)

### 3.1 Stage-Based Content
- Static & dynamic content categorized by pregnancy weeks
- Articles, tips, checklists, visuals

### 3.2 User Authentication (Optional)
- Email/password registration and login
- Strong password policy
- Forgot password flow

### 3.3 Personalized Dashboard (for signed-in users)
- Track pregnancy progress (by due date or last period)
- Save favorite articles
- Custom checklist

### 3.4 Admin Panel (Future)
- Content management (weeks, articles, assets)
- Role-based access

---

## 4. Database Schema (Draft)

### Users (Firestore Collection: `users`)
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

### Articles (Collection: `articles`)
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

---

## 5. Security & Compliance
- Firebase Rules for auth-based access
- Minimal PII collected (email, optional due date)
- HTTPS enforced on Firebase
- Conform with Israeli healthcare content verification

---

## 6. Development Workflow
- Git workflow: `main` (prod), `dev` (feature merge target)
- Feature branches → Pull Request to `dev`
- CI runs tests and deploy preview to Firebase Hosting emulator
- Merged to `main` → Production deploy

---

## 7. Roadmap

### Phase 1: MVP
- Content pages (during pregnancy)
- Auth flow
- Personalized dashboard

### Phase 2:
- Add before/after stages
- Admin panel
- Localization (Hebrew)
- Notifications

### Phase 3:
- Mobile app (Flutter or React Native)
- AI chatbot for FAQ

---

## 8. Notes
- All medical information must be reviewed and approved
- Content localization and tone adaptation for Israeli audiences is key
