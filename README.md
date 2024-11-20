# Domkos

## Overview
**Domkos** is a web application built with React and Firebase, designed to provide a seamless and interactive user experience. It features user authentication, real-time communication, and advanced UI/UX functionalities.

## Features
- Google Login/Register: Secure user authentication via Google OAuth.
- Dark/Light Mode: Toggle between themes for a personalized experience.
- Chatting: Real-time messaging functionality with Firebase.
- Typing Indicator: See when someone is typing in a chat.
- Logout: Securely log out from your account.
- Download CV: Option to download the user's CV directly from the header.

## Prerequisites
- Node.js >= 14
- Firebase CLI installed

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd domkos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file in the root directory
   touch .env

   # Add Firebase credentials in the following format:
   echo "REACT_APP_FIREBASE_API_KEY=your-api-key" >> .env
   echo "REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain" >> .env
   echo "REACT_APP_FIREBASE_PROJECT_ID=your-project-id" >> .env
   echo "REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket" >> .env
   echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id" >> .env
   echo "REACT_APP_FIREBASE_APP_ID=your-app-id" >> .env
   ```

## Scripts

- **Start the development server:**
  ```bash
  npm start
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Run tests:**
  ```bash
  npm test
  ```

- **Eject configurations:**
  ```bash
  npm run eject
  ```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using Firebase:
   ```bash
   firebase deploy
   ```

## Project Structure

- **src/components**: React components for the UI.
- **src/context**: Context API for managing themes (Dark/Light Mode) and global states.
- **src/firebase**: Firebase configuration and utility functions for authentication, messaging, and storage.
- **src/pages**: Main pages of the application (e.g., Home, Login, Chat).
- **public/**: Static assets and metadata.
- **functions/**: Backend logic implemented using Firebase Cloud Functions.

## Core Functionalities

### Google Login/Register
```bash
firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
```

### Dark/Light Mode
```bash
toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
```

### Real-Time Chatting
```bash
const chatRef = firebase.firestore().collection('chats');
chatRef.add({ message: 'Hello', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
```

### Typing Indicator
```bash
chatRef.doc('chatId').update({ typing: true });
```

### Logout
```bash
firebase.auth().signOut();
```

### Download CV
```bash
<a href="/path-to-cv.pdf" download>Download CV</a>
```

## Key Dependencies
- **react**: Library for building the user interface.
- **firebase**: Firebase SDK for authentication and real-time database.
- **react-firebase-hooks**: Simplified Firebase interaction.
- **lodash**: Utility functions for JavaScript.
- **react-router-dom**: Navigation between pages.

## Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.

## Acknowledgments
Special thanks to open-source contributors and libraries that made this project possible.
