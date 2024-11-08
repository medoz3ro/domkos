import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState, useRef } from 'react';

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
        {user ? <SignOut/> : <SignIn/>}
      </header>
      <section>
        {user ? <Chat /> : ''}
      </section>
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
  const { text, uid } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={props.message.photoURL} alt="User" />
      <p>{text}</p>
    </div>
  );
}

function Chat() {

const dummy = useRef()

  const messageReferences = collection(firestore, 'poruke');
  const messagesQuery = query(messageReferences, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    
    const { uid, photoURL } = auth.currentUser;
    
    try {
      await addDoc(messageReferences, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
      setFormValue('');
      dummy.current.scrollIntoView({behavior: 'smooth'});
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error: Unable to send message. Check your permissions.");
    }
  };
  

  return (
    <div>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='submit'>Pošalji</button>
      </form>
    </div>
  );
}

export default App;
