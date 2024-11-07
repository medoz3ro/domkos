import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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
  const [user] = useAuthState(auth); // Use it only within this component

  return (
    <div className="App">
      <header className="App-header"></header>
      <section>
        {user ? <Chat /> : <SignIn />}
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
  return <p>{text}</p>;
}

function Chat() {
  const messageReferences = collection(firestore, 'poruke');
  const messagesQuery = query(messageReferences, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

  return (
    <div>
      {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
      <SignOut />
    </div>
  );
}

export default App;
