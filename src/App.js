import './App.css';


import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, serverTimestamp, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';

const firebaseConfig = {
  apiKey: "AIzaSyAvy0w851FbcVUXZX51JTLqpPGpXOVMHZ8",
  authDomain: "domko-cbe7c.firebaseapp.com",
  projectId: "domko-cbe7c",
  storageBucket: "domko-cbe7c.appspot.com",
  messagingSenderId: "637063359036",
  appId: "1:637063359036:web:d087dcb8b8156cbc40b139",
  measurementId: "G-X4C19X83YL"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);


  return (
    <div>
      <header>
        <div> Benjamin Sabo </div>
        {user ? <SignOut /> : <SignIn />}
      </header>
      <div className="App">
        <section>{user ? <Chat /> : ''}</section>
      </div>
    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return <button onClick={signInWithGoogle}>Google prijava</button>;
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Odjavi se</button>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  
  // State for animated text
  const [animatedText, setAnimatedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const speed = 50; // Speed of typing in milliseconds

    // Function to type out the text character by character
    function typeWriter() {
      if (i <= text.length) {
        setAnimatedText(text.substring(0, i)); // Set text up to the current index
        i++;
        setTimeout(typeWriter, speed);
      }
    }

    setAnimatedText(''); // Clear the animatedText when a new message is received
    typeWriter();

  }, [text]); // Run the effect every time a new message text is received

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="User" />
      <p>{animatedText}</p>
    </div>
  );
}


function Chat() {
  const dummy = useRef();
  const messageReferences = collection(firestore, 'poruke');
  const messagesQuery = query(messageReferences, orderBy('createdAt'));
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [typingUser, setTypingUser] = useState(null);

  // Debounced function to update typing status
  const updateTypingStatus = debounce(async (isTyping) => {
    const typingDocRef = doc(firestore, 'typingStatus', 'status');
    if (isTyping) {
      await setDoc(typingDocRef, { uid: auth.currentUser.uid, name: auth.currentUser.displayName }, { merge: true });
    } else {
      await setDoc(typingDocRef, { uid: null, name: null }, { merge: true });
    }
  }, 500);

  const handleInputChange = (e) => {
    setFormValue(e.target.value);
    updateTypingStatus(Boolean(e.target.value.trim()));
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!formValue.trim()) return;

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messageReferences, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    updateTypingStatus(false);
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for changes in typing status
  useEffect(() => {
    const typingDocRef = doc(firestore, 'typingStatus', 'status');
    const unsubscribe = onSnapshot(typingDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTypingUser(data.uid !== auth.currentUser.uid ? data.name : null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="chat-container">

      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        {typingUser && (
          <div className="typing-indicator">
            <span>{typingUser} is typing</span>
            <div className="dot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          disabled={!formValue.trim()}
          className={!formValue.trim() ? 'disabled-button' : ''}
        >
          Pošalji
        </button>
      </form>
    </div>
  );
}

export default App;
