```markdown
# ConstructCRM

ConstructCRM is a modern, fast, and secure Customer Relationship Management (CRM) tool designed specifically for the construction industry. It's built with Next.js 15 (App Router), Firebase, TypeScript, Stripe, and Shadcn UI.

## Features (MVP)

*   User Authentication (Sign-up, Sign-in, Firebase Auth)
*   Subscription Management (Free, Monthly, Yearly tiers via Stripe)
*   Account Management (Profile updates, Stripe Customer Portal)
*   Project Management (CRUD operations for projects)
*   Client Management (Stubs - CRUD operations for clients)
*   Task Management (Stubs - Basic task tracking within projects)
*   Modern UI with Glassmorphism and Smooth Animations
*   Responsive Design

## Tech Stack

*   **Framework:** Next.js 15 (App Router, Server Components, Server Actions, Turbopack)
*   **Language:** TypeScript
*   **Backend & Database:** Firebase (Authentication, Firestore, Admin SDK)
*   **Payments:** Stripe (Checkout, Customer Portal, Webhooks)
*   **UI:** Shadcn UI, Tailwind CSS
*   **Styling:** Tailwind CSS, CSS Modules for custom effects

## Getting Started

### Prerequisites

*   Node.js (latest LTS)
*   npm, yarn, or pnpm
*   Firebase Account & Project
*   Stripe Account

### Environment Variables

1.  Copy `.env.example` (if provided) or create a new `.env.local` file in the root directory.
2.  Fill in the required environment variables as detailed in the file or the main report. This includes:
    *   Firebase Client SDK keys
    *   Firebase Admin SDK service account details (or individual project ID, client email, private key)
    *   Stripe Publishable Key, Secret Key, Webhook Secret
    *   Stripe Price IDs for your subscription plans
    *   `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000` for local dev)

### Firebase Setup

1.  Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
2.  Enable **Authentication**: Add the "Email/Password" sign-in provider.
3.  Set up **Firestore Database**: Create a Firestore database in Native mode. Choose a location.
    *   **Security Rules (Initial - for development, refine for production):**
        ```json
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read/write their own data
            match /users/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            // Allow users to read/write their own projects, clients, tasks
            match /{collection}/{docId} {
              allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
            }
          }
        }
        ```
4.  Register your web app in Firebase Project Settings and copy the Firebase SDK configuration snippet values into your `.env.local`.
5.  Generate a **Service Account Key** (JSON file) for the Firebase Admin SDK (Project Settings > Service Accounts). Use these details for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` environment variables.

### Stripe Setup

1.  Create a Stripe account at [dashboard.stripe.com](https://dashboard.stripe.com/).
2.  Create **Products** for your subscription tiers (e.g., "Pro Monthly", "Pro Yearly").
3.  For each product, create **Prices**. Note the Price IDs (e.g., `price_xxxxxxxx`). Add these to your `.env.local`.
4.  Set up a **Webhook Endpoint**:
    *   URL: `[YOUR_APP_URL]/api/stripe/webhooks` (e.g., `http://localhost:3000/api/stripe/webhooks` for local testing with Stripe CLI).
    *   Listen to events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
    *   Get the **Webhook Signing Secret** and add it to `.env.local`.
5.  Customize the **Stripe Customer Portal** settings in your Stripe dashboard.
6.  Copy your **Publishable Key** and **Secret Key** to `.env.local`.

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The development server uses Turbopack for faster builds.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

(Refer to the main report for a detailed project structure diagram.)

*   `/app`: Next.js App Router (pages, layouts, API routes).
*   `/components`: UI components (Shadcn UI, custom components).
*   `/lib`: Core logic (Firebase, Stripe, Server Actions, hooks, utils).
*   `/models`: TypeScript interfaces for data.
*   `/public`: Static assets.

## Deployment

*   **Vercel:** Recommended for Next.js applications.
*   **Firebase Hosting:** Can also be used, potentially with Cloud Functions or Cloud Run for the Next.js backend.

Ensure all environment variables are correctly set up in your deployment provider.
```