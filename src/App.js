// Import CSS for App styling
import "./App.css";

// Import Firebase initialization and necessary methods for authentication
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

// Import hooks for Firebase authentication and Firestore data
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useState, useRef } from "react";

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Main App Component
function App() {
  const [user] = useAuthState(auth); // Current user state
  const [displayName, setDisplayName] = useState(""); // User's display name
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  // Check if user document exists, otherwise show modal for setting display name
  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, "users", user.uid);

      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setDisplayName(docSnap.data().displayName);
        } else {
          setShowModal(true);
        }
      });
    }
  }, [user]);

  return (
    <div>
      <Header user={user} displayName={displayName} />
      <div className="App">
        <section>
          {user ? (
            displayName ? (
              <Chat displayName={displayName} />
            ) : (
              showModal && <DisplayNameModal setDisplayName={setDisplayName} />
            )
          ) : (
            ""
          )}
        </section>
      </div>
    </div>
  );
}

// Header Component: Shows app title, user's profile, and sign-out button
function Header({ user, displayName }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleSignOut = () => auth.signOut();

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="header-title">
        <a href="/CV_SABO.pdf" target="_blank" rel="noopener noreferrer" download>
          💬 Benjamin Sabo 💬
        </a>
      </div>
      <div className="header-profile" ref={dropdownRef}>
        {user ? (
          <div className="profile" onClick={toggleDropdown}>
            <img src={user.photoURL} alt="User" className="profile-pic" />
            <span className="display-name-header">{displayName}</span>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleSignOut}>Odjavi se</button>
              </div>
            )}
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </header>
  );
}

// SignIn Component: Button to sign in using Google authentication
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <button onClick={signInWithGoogle} className="sign-in-button">
      Prijavi se
    </button>
  );
}

// DisplayNameModal Component: Modal for setting display name on first login
function DisplayNameModal({ setDisplayName }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const userRef = doc(firestore, "users", auth.currentUser.uid);

      await setDoc(userRef, { displayName: inputValue.trim() }, { merge: true });
      setDisplayName(inputValue.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Set Your Display Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

// ChatMessage Component: Individual chat message with optional animated typing effect
function ChatMessage({ message }) {
  const { text, uid, photoURL, displayName } = message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const [animatedText, setAnimatedText] = useState("");

  // Typing animation effect
  useEffect(() => {
    let i = 0;
    const speed = 50;

    function typeWriter() {
      if (i <= text.length) {
        setAnimatedText(text.substring(0, i));
        i++;
        setTimeout(typeWriter, speed);
      }
    }

    setAnimatedText("");
    typeWriter();
  }, [text]);

  return (
    <div className={`message ${messageClass}`}>
      <div className="message-look">
        <img src={photoURL} alt="User" />
        <div>
          {uid !== auth.currentUser.uid && (
            <p className="display-name">{displayName}</p>
          )}
          <p>{animatedText}</p>
        </div>
      </div>
    </div>
  );
}

// Chat Component: Main chat interface with typing indicators and message sending
function Chat({ displayName }) {
  const dummy = useRef(); // Reference to the bottom of the chat for auto-scroll
  const messageReferences = collection(firestore, "poruke");
  const messagesQuery = query(messageReferences, orderBy("createdAt"));
  const [messages] = useCollectionData(messagesQuery, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLimitReached, setIsLimitReached] = useState(false);

  // Updates typing status in Firestore for the current user
  const updateTypingStatus = async (isTyping) => {
    const typingDocRef = doc(firestore, "typingStatus", auth.currentUser.uid);

    if (isTyping) {
      await setDoc(typingDocRef, { name: displayName, typing: true });
    } else {
      await setDoc(typingDocRef, { typing: false }, { merge: true });
    }
  };

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update typing status when user types in input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setFormValue(value);
    setIsLimitReached(value.length >= 100);

    // Clear typing status if the input is empty
    updateTypingStatus(Boolean(value.trim()));
  };

  // Smooth scroll to bottom after each message is added
  useEffect(() => {
    const scrollToBottom = () => {
      if (dummy.current) {
        dummy.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    const timeoutId = setTimeout(scrollToBottom, 100); // 100ms delay
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Clear typing status on form submission
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return;

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messageReferences, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });

    setFormValue("");
    setIsLimitReached(false);
    updateTypingStatus(false);
  };

  // Real-time subscription to typing status
  useEffect(() => {
    const typingCollectionRef = collection(firestore, "typingStatus");

    const unsubscribe = onSnapshot(typingCollectionRef, (snapshot) => {
      const activeTypingUsers = snapshot.docs
        .filter((doc) => doc.data().typing && doc.id !== auth.currentUser.uid)
        .map((doc) => doc.data().name);

      setTypingUsers(activeTypingUsers);
    });

    return () => unsubscribe();
  }, []);

  // Display typing indicator based on other users' activity
  const typingIndicator = typingUsers.length
    ? typingUsers.join(", ") + (typingUsers.length > 1 ? " are typing" : " is typing")
    : null;

  return (
    <div className="chat-container">
      <main>
        {messages && messages.map((msg, index) => (
          <ChatMessage key={msg.id || index} message={msg} />
        ))}
        <div ref={dummy}></div> {/* Dummy div for scrolling */}
      </main>

      {typingIndicator && (
        <div className="typing-indicator">
          <span>{typingIndicator}</span>
          <div className="dot-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {isLimitReached && (
        <p style={{ color: "red", fontSize: "0.9rem", marginTop: "5px" }}>
          Character limit reached (100 characters).
        </p>
      )}

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={handleInputChange}
          disabled={!displayName}
          placeholder={
            displayName ? "Type a message" : "Set a display name first"
          }
          maxLength={100}
        />
        <button
          type="submit"
          disabled={!formValue.trim() || !displayName}
          className={!formValue.trim() ? "disabled-button" : ""}
        >
          Pošalji
        </button>
      </form>
    </div>
  );
}

export default App;
