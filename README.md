# Social Media App

A full-stack social media application allowing users to post "screams", comment on screams, and chat with other users.

## Technologies Used

- **Frontend:** React, Redux, Tailwind CSS, Vite
- **Backend:** Firebase (Cloud Functions, Firestore, Authentication, Storage)

## Key Features

- User authentication (sign up, login, logout)
- Create, view, and delete "screams" (posts)
- Comment on screams
- Real-time chat functionality
- User profile updates

## Setup and Running

### Frontend

1. Navigate to the `ApplicationFrontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Backend

1. Make sure you have the Firebase CLI installed and configured.
2. Navigate to the `ApplicationBackend/functions` directory.
3. Install dependencies: `npm install`
4. To run with Firebase emulators (recommended for local development): `npm run serve`
5. To deploy functions: `npm run deploy`

## Project Structure

- `ApplicationFrontend/`: Contains the React-based frontend application.
- `ApplicationBackend/`: Contains the Firebase backend, including Cloud Functions, Firestore rules, and storage rules.
