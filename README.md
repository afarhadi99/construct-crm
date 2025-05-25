```markdown
# ConstructCRM 🏗️

**ConstructCRM** is a modern, fast, and secure Customer Relationship Management (CRM) and project management tool designed specifically for the **construction industry**. It helps builders, contractors, and construction firms streamline their projects, manage client relationships, track progress, and handle finances more efficiently.

Built with a cutting-edge technology stack including Next.js 15, Firebase, TypeScript, and Stripe, ConstructCRM aims to provide an intuitive user experience and powerful features tailored to the unique needs of construction professionals.

## ✨ Key Features
 
*   **User Authentication:** Secure sign-up, sign-in, and session management powered by Firebase Authentication.
*   **Subscription Tiers:** Flexible subscription plans (Free, Pro Monthly, Pro Yearly) managed via Stripe, with access to different feature sets.
*   **Account Management:** Users can update their profile information and manage their subscription through an integrated Stripe Customer Portal.
*   **Project Management:**
    *   Create, view, edit, and delete projects.
    *   Track key project details: name, address, client, start/end dates, status, budget, description, and internal notes.
    *   Subscription-gated limits for project creation on the free tier.
*   **Client Management (Core):**
    *   Create, view, edit, and delete client profiles.
    *   Store contact information, company details, and notes for each client.
    *   (Future: Link clients directly to multiple projects).
*   **Task Management (Basic - within Projects):**
    *   (Stubbed for future expansion) Create, view, edit, and delete tasks associated with specific projects.
    *   Track task status, priority, and due dates.
*   **Modern & Responsive UI:**
    *   Sleek, intuitive interface built with Shadcn UI and Tailwind CSS.
    *   Glassmorphic design elements for a contemporary feel.
    *   Smooth animations and transitions.
    *   Fully responsive for use on desktop, tablet, and mobile devices.
*   **Performance Optimized:** Leveraging Next.js 15 App Router, Server Components, and Turbopack for fast load times and a smooth user experience.
*   **Secure by Design:**
    *   Stripe for PCI-compliant payment processing.
    *   Firebase for secure data storage and authentication.
    *   Server Actions and API route protection.

## 🚀 Tech Stack

*   **Frontend Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/)
    *   Firebase Authentication
    *   Cloud Firestore (NoSQL Database)
    *   Firebase Admin SDK
*   **Payment & Subscriptions:** [Stripe](https://stripe.com/)
    *   Stripe Checkout
    *   Stripe Customer Portal
    *   Stripe Webhooks
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Deployment (Recommended):** [Vercel](https://vercel.com/)

## 🛠️ Getting Started

### Prerequisites

*   Node.js (latest LTS version recommended)
*   npm, yarn, or pnpm package manager
*   A Firebase Account & a new Firebase Project
*   A Stripe Account

### Environment Variables

1.  Create a `.env.local` file in the root of the project.
2.  Copy the contents of `.env.example` into `.env.local`.
3.  Fill in the required environment variables with your actual keys and IDs from Firebase and Stripe:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   `FIREBASE_PROJECT_ID` (for Admin SDK)
    *   `FIREBASE_CLIENT_EMAIL` (for Admin SDK)
    *   `FIREBASE_PRIVATE_KEY` (for Admin SDK - ensure newlines `\n` are correctly formatted, often as `\\n` in .env files or directly pasted in hosting provider env vars)
    *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    *   `STRIPE_SECRET_KEY`
    *   `STRIPE_WEBHOOK_SECRET`
    *   `STRIPE_PRICE_ID_MONTHLY` (Your Stripe Price ID for the monthly plan)
    *   `STRIPE_PRICE_ID_YEARLY` (Your Stripe Price ID for the yearly plan)
    *   `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000` for local development, your production URL for deployment)

### Firebase Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
2.  **Authentication:**
    *   Navigate to Authentication > Sign-in method.
    *   Enable the "Email/Password" provider.
3.  **Firestore Database:**
    *   Navigate to Firestore Database > Create database.
    *   Start in **production mode** (or test mode, but be sure to update security rules).
    *   Choose a Firestore location.
    *   **Security Rules (Important!):** Update your Firestore security rules for proper data access control. A basic set for development (allowing authenticated users to manage their own data) would be:
        ```json
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId} {
              allow read, update, delete: if request.auth != null && request.auth.uid == userId;
              allow create: if request.auth != null; // Or more specific create rules
            }
            match /projects/{projectId} {
              allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
            }
            match /clients/{clientId} {
              allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
            }
            match /tasks/{taskId} {
              allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
            }
          }
        }
        ```
        *Refine these rules for production based on your exact needs.*
4.  **Web App Registration:**
    *   In Project Settings (⚙️ icon) > General, scroll down to "Your apps".
    *   Click the web icon (`</>`) to register a new web app.
    *   Copy the `firebaseConfig` object values into your `.env.local` file for the `NEXT_PUBLIC_FIREBASE_*` variables.
5.  **Service Account (for Admin SDK):**
    *   In Project Settings > Service accounts.
    *   Generate a new private key (JSON file).
    *   Use the `project_id`, `client_email`, and `private_key` from this JSON file for your `FIREBASE_*` environment variables.

### Stripe Setup

1.  Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2.  **Products & Prices:**
    *   Create at least two Products: one for your "Pro Monthly" subscription and one for "Pro Yearly".
    *   For each Product, create a recurring Price. Note the **Price ID** (e.g., `price_xxxxxxxxxxxxxx`) for each. These are your `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`.
3.  **API Keys:**
    *   Navigate to Developers > API keys.
    *   Copy your **Publishable key** (`pk_test_...` or `pk_live_...`) and **Secret key** (`sk_test_...` or `sk_live_...`). Add these to `.env.local`.
4.  **Webhook Endpoint:**
    *   Navigate to Developers > Webhooks.
    *   Click "Add endpoint".
    *   Endpoint URL: `[YOUR_APP_URL]/api/stripe/webhooks` (e.g., `http://localhost:3000/api/stripe/webhooks` for local testing with the Stripe CLI, or your production URL).
    *   Events to listen to:
        *   `checkout.session.completed`
        *   `customer.subscription.created`
        *   `customer.subscription.updated`
        *   `customer.subscription.deleted`
    *   After creating the endpoint, reveal the **Signing secret** (`whsec_...`) and add it to `.env.local`.
5.  **Customer Portal:**
    *   Navigate to Settings > Customer portal (under Billing).
    *   Configure the portal settings as needed (e.g., allow subscription cancellation, payment method updates).

### Installation & Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```
2.  **Shadcn UI (if not already done by the AI):**
    *   Initialize Shadcn UI: `npx shadcn-ui@latest init`
    *   Add components used: `npx shadcn-ui@latest add button card input label dropdown-menu avatar toast dialog separator sheet select popover calendar textarea badge alert-dialog`
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```
    The application will be available at `http://localhost:3000` (or your configured port). It uses Turbopack for faster development builds.

## 🏗️ Project Structure Overview

*   `/app`: Contains all routes, layouts, and UI for the Next.js App Router.
    *   `/(auth)`: Route group for authentication pages (sign-in, sign-up).
    *   `/(dashboard)`: Route group for authenticated user pages (dashboard, projects, clients, account).
    *   `/api`: API routes, including Stripe webhooks.
    *   `layout.tsx`: Root layout.
    *   `page.tsx`: Main landing page.
*   `/components`: Shared React components.
    *   `/auth`: Authentication-related components.
    *   `/dashboard`: Components specific to the user dashboard and CRM features.
    *   `/layout`: Layout components like Navbar, Footer.
    *   `/ui`: Shadcn UI components.
*   `/lib`: Core logic, utilities, and configurations.
    *   `/actions`: Server Actions for mutations and server-side logic.
    *   `/firebase`: Firebase client and admin SDK initializations.
    *   `/hooks`: Custom React hooks.
    *   `/stripe`: Stripe client and admin SDK initializations.
    *   `/utils`: General utility functions.
    *   `constants.ts`: Application-wide constants.
*   `/models`: TypeScript interfaces defining data structures.
*   `/public`: Static assets like images and favicons.

## 🚀 Deployment

**Vercel** (from the creators of Next.js) is the recommended platform for deploying ConstructCRM due to its seamless integration with Next.js features.

1.  Push your code to a GitHub (or GitLab/Bitbucket) repository.
2.  Sign up or log in to [Vercel](https://vercel.com/).
3.  Import your project from your Git provider.
4.  Configure Environment Variables in the Vercel project settings (use the same ones from your `.env.local`).
5.  Deploy!

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

(Further contribution guidelines can be added here, e.g., coding standards, branch naming conventions.)

## 📄 License

This project is currently proprietary.
(If you intend to make it open source, you can choose a license like MIT: `This project is licensed under the MIT License - see the LICENSE.md file for details.`)

---

Built with ❤️ by The Machine for ConstructCRM.
```
