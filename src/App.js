import React, { useState } from 'react';
import './App.scss';
import ErrorBoundary from './errorcheck.js'
import firebase from 'firebase/compat/app';
import config from './config.json';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import CanvasDraw from 'react-canvas-draw';

//config
firebase.initializeApp(
  config
)

const auth = firebase.auth();
const firestore = firebase.firestore();

let app_refs = {
  'canvasRef': React.createRef(),
  'newDiv': React.createRef(),
  'canvasInput': React.createRef()
}
//canvas

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <SignOut />
      </header>
      <section className='messages-wrapper'>
        {user ? <ChatRoom /> : <SignIn />}
        {/* <DrawCanvas /> */}
      </section>
    </div>
  );
}

function DrawCanvas() {
  //canvas referen
  const [drawing_value, set_drawing_string] = useState('');

  const messagesRef = firestore.collection('messages');

  const send_message = async (e) => {
    e.preventDefault();

    const user_info = auth.currentUser;
    await messagesRef.add({
      msg: drawing_value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      profile_id: user_info.uid,
      image: true,
      user: user_info.displayName,
      profile_image: user_info.photoURL
    });
    app_refs.canvasRef.current.clear();
  }
  return (
    // {classname previously draw-canvas hide, find better way to open and close the canvas}
    <div className={'draw-canvas'} ref = {app_refs.newDiv}>
      <form onSubmit={send_message}>
        <CanvasDraw ref = {app_refs.canvasRef}
          className = 'canvascanvascanvas'
          style={{
            boxShadow: "0 13px 27px -5px rgba(50, 50, 93, 0.25),    0 8px 16px -8px rgba(0, 0, 0, 0.3)",

          }} onChange={(e) => {
            set_drawing_string(e.getSaveData());
          }} />

        <button type='submit'> Send it</button>
      </form>

    </div>

  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <button onClick={signInWithGoogle}> Sign In with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}> Sign out </button>
  )
}
function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [needCanvas, setCanvas] = useState(false);


  const toggle_canvas = () => {
    needCanvas ? setCanvas(false) : setCanvas(true);
    // toggle_class(needCanvas);
  }
  const send_message = async (e) => {
    //no refresh
    e.preventDefault();

    const user_info = auth.currentUser;
    await messagesRef.add({
      msg: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      profile_id: user_info.uid,
      image: false,
      user: user_info.displayName,
      profile_image: user_info.photoURL
      //PHOTOURL for later
    });

    setFormValue('');
  }
  return (<>
    <div className='content'>
      <div className='messages'>
        {messages && messages.map(msg => <ChatMessage key={msg.id} options={msg} />)}
      </div>

      <div className='form-input'>
        <form onSubmit={send_message}>
          <input value={formValue} placeholder='Write something' onChange={(e) => setFormValue(e.target.value)} />
          <button type='button' className = 'draw-toggle' onClick={toggle_canvas}> fortnite draw </button>
          <button type='Submit' className = 'text-button'> Send  </button>

        </form>
        
        {needCanvas ?  <DrawCanvas/>: null}
        {/* {console.log(app_refs.newDiv.current.addClass('hey'))} */}

      </div>


    </div>
  </>)
}


//why does htis get called twoit
function ChatMessage(props) {
  const message_properties = props.options;

  const message = message_properties.profile_id === auth.currentUser.uid ? 'sent' : 'received';
  //If it 
  if (message_properties.image) {
    return <div className={`message ${message}`} >
          <img src = {message_properties.profile_image} alt= 'profile' className= 'prof' />

      <div className='content'>
        <div className='name'>
          {message_properties.user}

        </div>
        <div className='message-content'>
          <ErrorBoundary>
            <CanvasDraw
              propTypes={{
                canvasWidth: '10px',
                canvasHeight: '10px'
              }}
              className = 'canvas-result'
              canvasWidth={200}
              canvasHeight={200}
              style={{
                width: '150px',
                height: '150px'
              }}
              disabled hideGrid ref={canvasDraw => {
                if (!canvasDraw) {
                  return null;
                }
                if (message_properties.msg) {
                  canvasDraw.loadSaveData(message_properties.msg);
                }
              }} />
          </ErrorBoundary>
        </div>


      </div>

    </div>;
  }

return <div className={`message ${message}`}>
    <img src = {message_properties.profile_image} alt= 'profile' className= 'prof' />
    <div className = 'content'>
      <div className = 'name'>
        {message_properties.user}
      </div>
      <div className = 'message-content'>
        {message_properties.msg}
      </div>
    </div>
  </div>
}

export default App;
