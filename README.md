# Social Platform

A comprehensive full-stack social media application built with modern web technologies, enabling users to share posts, engage in real-time conversations, and build communities.

## 🚀 Features

### Core Functionality

- **User Authentication**: Secure sign-up, login, and logout with Firebase Authentication
- **Posts (Screams)**: Create, view, like, comment on, and delete posts
- **Real-time Chat**: Instant messaging between users with read receipts
- **Notifications**: Real-time notifications for likes, comments, and messages
- **User Profiles**: Customizable profiles with profile pictures and personal details
- **Social Interactions**: Like posts, comment on posts, follow other users

### Technical Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live notifications and chat using Firebase
- **Image Upload**: Profile picture and post image uploads to Firebase Storage
- **Data Persistence**: Robust data storage with Firestore
- **State Management**: Efficient state handling with Redux Toolkit

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management and data flow
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **Vite** - Fast build tool and development server
- **Firebase SDK** - Frontend integration with Firebase services

### Backend

- **Firebase Cloud Functions** - Serverless backend functions
- **Firestore** - NoSQL database for real-time data
- **Firebase Authentication** - User authentication and authorization
- **Firebase Storage** - File uploads and storage
- **Express.js** - API framework for Cloud Functions

### Development Tools

- **ESLint** - Code linting and formatting
- **Firebase Emulators** - Local development environment
- **Vite Dev Server** - Fast development and hot reloading

## 📁 Project Structure

```
socialPlatform/
├── ApplicationFrontend/          # React frontend application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── redux/               # State management
│   │   ├── utils/               # Utility functions and hooks
│   │   └── assets/              # Images and icons
│   ├── package.json
│   └── vite.config.js
├── ApplicationBackend/           # Firebase backend
│   ├── functions/                # Cloud Functions
│   │   ├── handlers/            # API route handlers
│   │   ├── utils/               # Backend utilities
│   │   └── index.js             # Main functions file
│   ├── firestore.rules          # Firestore security rules
│   ├── storage.rules            # Storage security rules
│   └── firebase.json            # Firebase configuration
├── package.json                  # Root package configuration
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd socialPlatform
   ```

2. **Set up Firebase**

   ```bash
   # Login to Firebase
   firebase login

   # Initialize Firebase project (if not already done)
   firebase init
   ```

3. **Frontend Setup**

   ```bash
   cd ApplicationFrontend
   npm install
   npm run dev
   ```

4. **Backend Setup**
   ```bash
   cd ../ApplicationBackend/functions
   npm install
   ```

### Running the Application

#### Development Mode (Recommended)

```bash
# From ApplicationBackend directory
firebase emulators:start --import=./functions/emulator-data --export-on-exit=./functions/emulator-data
```

run this command to start the Firebase emulators. It will import data from the emulator-data directory and export data to the emulator-data directory when the emulators are stopped.

```bash
npm run serve
```

## 🔒 Security Features

- **Authentication Middleware**: Protects sensitive routes
- **Firestore Security Rules**: Database-level access control
- **Storage Security Rules**: File upload restrictions
- **Input Validation**: Server-side data validation
- **CORS Configuration**: Cross-origin request handling

1. **Build Frontend**

   ```bash
   cd ApplicationFrontend
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Firebase for providing excellent backend services
- React community for amazing documentation and tools
- Tailwind CSS for beautiful and responsive design
