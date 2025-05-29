# Firebase Setup Instructions for Your Next.js Project

This guide will walk you through setting up a Firebase project and connecting it to your Next.js application.

## 1. Create a New Firebase Project

1.  **Go to the Firebase Console:** Open your web browser and navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/). You'll need to sign in with your Google account.
2.  **Add/Create a Project:**
    *   Click on "**Add project**" or "**Create a project**".
3.  **Project Name:**
    *   Enter a name for your Firebase project (e.g., "yehudit-the-midwife").
    *   Click "**Continue**".
4.  **Google Analytics (Optional but Recommended):**
    *   You can choose to enable Google Analytics for your Firebase project. This provides useful insights into app usage.
    *   If you enable it, you'll be prompted to select or create a Google Analytics account.
    *   Click "**Continue**".
5.  **Accept Terms:**
    *   Accept the Firebase terms and conditions.
    *   Click "**Create project**". Firebase will take a few moments to provision your new project.

## 2. Enable Firebase Authentication

1.  **Navigate to Authentication:**
    *   Once your project is ready, you'll be taken to the project overview page.
    *   In the left-hand navigation menu, click on "**Build**" > "**Authentication**".
2.  **Get Started:**
    *   Click the "**Get started**" button.
3.  **Enable Email/Password Sign-in:**
    *   You'll see a list of sign-in providers.
    *   Select "**Email/Password**" from the list.
    *   Toggle the "**Enable**" switch for Email/Password.
    *   Click "**Save**".

## 3. Set Up Firestore Database

1.  **Navigate to Firestore:**
    *   In the left-hand navigation menu, click on "**Build**" > "**Firestore Database**".
2.  **Create Database:**
    *   Click the "**Create database**" button.
3.  **Choose Mode (Test Mode Recommended for Now):**
    *   **"Start in production mode":** Your data will be private by default. You'll need to write security rules to allow access.
    *   **"Start in test mode":** Your data will be open for reads and writes for a limited time (usually 30 days). This is useful for initial development.
    *   **Recommendation:** Select "**Start in test mode**" for now.
    *   **Important Note:** Remember to secure your database with proper Firebase Security Rules before deploying your application to production. You'll see a warning about the test mode rules; click "**Next**".
4.  **Select Firestore Location:**
    *   Choose a Cloud Firestore location. This is the region where your data will be stored. Select a region close to your target users for lower latency (e.g., `us-central`, `europe-west`).
    *   Click "**Enable**". Firestore will take a few moments to provision.

## 4. (Optional) Set Up Firebase Cloud Storage

If your application will handle file uploads (e.g., images, videos), you'll need Firebase Cloud Storage.

1.  **Navigate to Storage:**
    *   In the left-hand navigation menu, click on "**Build**" > "**Storage**".
2.  **Get Started:**
    *   Click the "**Get started**" button.
3.  **Security Rules:**
    *   You'll be prompted about security rules for Storage. The default rules allow authenticated users to read and write their own files. You can start with these and modify them later as needed.
    *   Click "**Next**" and then "**Done**".

## 5. Get Your Firebase Project Configuration

1.  **Go to Project Settings:**
    *   In the Firebase console, at the top of the left-hand navigation menu, click the **gear icon** (⚙️) next to "**Project Overview**".
    *   Select "**Project settings**".
2.  **Your Apps:**
    *   Under the "**General**" tab (which should be selected by default), scroll down to the "**Your apps**" section.
3.  **Add a Web App:**
    *   Click the web icon (`</>`) to add a new web app. If you previously selected to add an app during project creation for features like Analytics, you might already see an app listed. If so, you can click on it to view its configuration.
4.  **Register App:**
    *   **App nickname:** Enter a nickname for your web app (e.g., "Yehudit Web App" or "My Nextjs App").
    *   **Firebase Hosting:** You can skip the "Also set up Firebase Hosting for this app" option for now if you plan to deploy your Next.js app to a different platform (like Vercel or Netlify) or set up Hosting later.
    *   Click "**Register app**".
5.  **Copy Firebase Config:**
    *   After registering, Firebase will display the `firebaseConfig` object. This object contains the keys your Next.js app needs to connect to your Firebase project.
    *   It will look something like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX",
          authDomain: "your-project-id.firebaseapp.com",
          projectId: "your-project-id",
          storageBucket: "your-project-id.appspot.com",
          messagingSenderId: "123456789012",
          appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX"
        };
        ```
    *   **Copy this entire `firebaseConfig` object.** You'll need it in the next step.
    *   Click "**Continue to console**".

## 6. Create Firebase Configuration File in Next.js

You have already created `my-app/src/lib/firebase/firebaseConfig.ts` with the following content:

```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// A more robust way to initialize, especially with HMR (Hot Module Replacement)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```
This file is set up to read your Firebase keys from environment variables.

## 7. Create `.env.local` File for Firebase Keys

For security, your Firebase configuration keys should not be hardcoded directly into your application code. Instead, use environment variables. Next.js has built-in support for environment variables using `.env.local` files.

1.  **Create `.env.local`:**
    *   In the root directory of your Next.js project (i.e., inside the `my-app` folder), create a new file named `.env.local`.
2.  **Add Firebase Config Values:**
    *   Open `.env.local` and paste your Firebase configuration values, prefixing each key with `NEXT_PUBLIC_`. **Replace `"YOUR_..."` placeholders with the actual values you copied from the Firebase console.**

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    ```
3.  **Important Security Note:**
    *   Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is necessary for the Firebase SDK to work on the client-side. Ensure your Firebase Security Rules for Authentication, Firestore, and Storage are properly configured to protect your data.
4.  **Add to `.gitignore`:**
    *   The `.env.local` file contains sensitive credentials and should **NEVER** be committed to Git.
    *   Open your `.gitignore` file (in the `my-app` root) and ensure that `.env.local` is listed. The default Next.js `.gitignore` should already include it. If not, add this line:
        ```
        .env.local
        ```

## 8. Install Firebase SDK (Already Done)

You have already installed the Firebase SDK in your Next.js project using:
`npm install firebase`

---

You have now completed the Firebase setup for your Next.js project! You can import `auth`, `db`, and `storage` from `my-app/src/lib/firebase/firebaseConfig.ts` into your components and pages to interact with Firebase services.
Remember to restart your Next.js development server (`npm run dev`) after creating or modifying `.env.local` for the environment variables to be loaded.

---

## 9. CI/CD Setup with GitHub Actions

Your project includes GitHub Actions workflows for Continuous Integration (CI) and Continuous Deployment (CD) to Firebase Hosting.

### CI Workflow (`my-app/.github/workflows/ci.yml`)

*   **Trigger:** Runs on pushes to `main` and `dev` branches, and on pull requests targeting `dev`.
*   **Jobs:**
    *   `test`: Checks out code, sets up Node.js, installs dependencies, runs linters (`npm run lint`), unit tests (`npm run test:unit`), and E2E tests (`npm run test:e2e`). Playwright browsers are installed before E2E tests.

### CD Workflow (`my-app/.github/workflows/deploy_firebase.yml`)

*   **Trigger:** Runs on pushes to the `main` branch.
*   **Jobs:**
    *   `build_and_deploy`: Checks out code, sets up Node.js, installs dependencies, builds the Next.js application (`npm run build`), and then deploys it to Firebase Hosting.

### Required GitHub Secrets for Deployment

For the CD workflow (`deploy_firebase.yml`) to successfully deploy to Firebase Hosting, you **must** configure the following secrets in your GitHub repository settings (Settings -> Secrets and variables -> Actions -> New repository secret):

1.  **`FIREBASE_SERVICE_ACCOUNT_YEHUDIT_THE_MIDWIFE`**:
    *   **Content**: The full JSON content of a Firebase service account key.
    *   **How to get**:
        1.  Go to your Firebase Project -> Project Settings (gear icon) -> **Service accounts** tab.
        2.  Under "Firebase Admin SDK", select the "Node.js" option for code samples.
        3.  Click the "**Generate new private key**" button. A JSON file will be downloaded.
        4.  Open this JSON file, copy its **entire content**.
        5.  Paste the JSON content as the value for the `FIREBASE_SERVICE_ACCOUNT_YEHUDIT_THE_MIDWIFE` secret in GitHub.

2.  **`FIREBASE_PROJECT_ID_YEHUDIT_THE_MIDWIFE`**:
    *   **Content**: Your Firebase Project ID.
    *   **How to get**: Go to your Firebase Project -> Project Settings (gear icon) -> **General** tab. Copy the "Project ID" (e.g., `your-project-id`).
    *   Paste your Project ID as the value for the `FIREBASE_PROJECT_ID_YEHUDIT_THE_MIDWIFE` secret in GitHub.

### Build-Time Environment Variables for Firebase Configuration (Optional but Recommended)

Your `my-app/src/lib/firebase/firebaseConfig.ts` file reads Firebase configuration from `process.env.NEXT_PUBLIC_FIREBASE_...` variables. These are crucial for your app to connect to the correct Firebase project.

*   **For Local Development**: These are sourced from your `.env.local` file (which should be in `.gitignore`).
*   **For Deployment to Firebase Hosting**:
    *   **Runtime Configuration**: Firebase Hosting allows you to set up environment variables directly in the Firebase console (Hosting -> select your site -> Environment variables). This is a good way to provide these `NEXT_PUBLIC_...` variables at runtime.
    *   **Build-Time Configuration (if needed by Next.js build process)**: If your Next.js application uses these variables during the build process (e.g., for Server-Side Generation (SSG) of pages that embed this config, or if server components need them), they must also be available in the GitHub Actions build environment.
        *   The `deploy_firebase.yml` workflow has a commented-out `env` section in the "Build Next.js application" step.
        *   If you need these at build time:
            1.  Uncomment the `env` block in `my-app/.github/workflows/deploy_firebase.yml`.
            2.  For each `NEXT_PUBLIC_FIREBASE_...` variable, create a corresponding secret in GitHub (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.).
            3.  The value for `NEXT_PUBLIC_FIREBASE_PROJECT_ID` would be the same as `FIREBASE_PROJECT_ID_YEHUDIT_THE_MIDWIFE`.

### Update `.firebaserc`

The `my-app/.firebaserc` file tells the Firebase CLI which project to use by default. You need to update it with your Firebase Project ID:

1.  Open `my-app/.firebaserc`.
2.  It was created with the following content:
    ```json
    {
      "projects": {
        "default": ""
      }
    }
    ```
3.  Replace the empty string `""` with your actual Firebase Project ID (the same one used for the `FIREBASE_PROJECT_ID_YEHUDIT_THE_MIDWIFE` secret). For example:
    ```json
    {
      "projects": {
        "default": "your-project-id" 
      }
    }
    ```
4.  Commit and push this change to your repository.

### Firebase Hosting Configuration (`firebase.json`)

The `my-app/firebase.json` file is configured for hosting a Next.js application using Firebase's `frameworksBackend` feature, which handles the build and serving of Next.js apps. The region is set to `us-central1` by default; you can change this if needed.

It was created with the following content:
```json
{
  "hosting": {
    "source": ".", 
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-central1" 
    }
  }
}
```
This setup means Firebase will automatically detect and build your Next.js app using the settings in your `next.config.js` (or `next.config.mjs`).

### Branch Protection Rules (Recommended)

To ensure that code merged into `main` (and thus deployed) has passed all tests:

1.  In your GitHub repository, go to Settings -> Branches.
2.  Click "Add branch protection rule".
3.  For "Branch name pattern", enter `main`.
4.  Enable "**Require status checks to pass before merging**".
    *   Search for and select the `Test Application` status check (this is the name of the job in `ci.yml`).
5.  (Optional but recommended) Enable "**Require pull request reviews before merging**".
6.  Click "Create".

This configuration helps maintain a stable `main` branch that is always deployable.

---

## 10. Triggering Your First Deployment (Go Live)

Once you have completed all the setup steps above, you are ready to deploy your application to Firebase Hosting.

### Prerequisites:

1.  **Code Pushed to GitHub:**
    *   Ensure all your code, including the latest Next.js application (`my-app` directory) and the `.github/workflows` directory, is committed and pushed to your GitHub repository.

2.  **GitHub Secrets Configured:**
    *   Confirm you have created the required GitHub Secrets:
        *   `FIREBASE_SERVICE_ACCOUNT_YEHUDIT_THE_MIDWIFE`
        *   `FIREBASE_PROJECT_ID_YEHUDIT_THE_MIDWIFE`
    *   These should be in your repository's **Settings > Secrets and variables > Actions**. Refer to Section 9 for details on how to create these.

3.  **`.firebaserc` Updated:**
    *   Verify you have updated `my-app/.firebaserc` with your Firebase Project ID as the `default` project. For example:
      ```json
      {
        "projects": {
          "default": "your-project-id" 
        }
      }
      ```
    *   Commit and push this change if you haven't already.

4.  **Branch Protection (Recommended):**
    *   (Optional but highly recommended) Consider setting up branch protection rules for your `main` branch to require CI checks (from `ci.yml`, specifically the "Test Application" job) to pass before merging. This ensures that only tested code gets deployed.

### Deployment Trigger:

*   To deploy the application, **merge your development branch (e.g., `dev`) into the `main` branch.**
*   This merge action into `main` will automatically trigger the "Deploy to Firebase Hosting" workflow defined in `my-app/.github/workflows/deploy_firebase.yml`.

### Monitoring the Deployment:

1.  Go to the **Actions** tab of your GitHub repository.
2.  Look for the workflow run named "Deploy to Firebase Hosting".
3.  You can click on it to see the progress of the build and deployment steps.

### Accessing Your Live Site:

*   Once the "Deploy to Firebase Hosting" workflow completes successfully, your application will be live.
*   You can access it at:
    *   `https://<YOUR_FIREBASE_PROJECT_ID>.web.app`
    *   `https://<YOUR_FIREBASE_PROJECT_ID>.firebaseapp.com`
    *   (Replace `<YOUR_FIREBASE_PROJECT_ID>` with your actual Firebase Project ID).
*   You can also find your hosting URLs in the Firebase Console under **Hosting** (you may need to refresh the page if it was open during the deployment).

Congratulations! Your Next.js application should now be deployed and accessible. If you encounter any issues, check the logs in the GitHub Actions workflow for error messages.
