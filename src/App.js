import React, { useState } from 'react';
import './App.css';
import ErrorBoundary from './errorcheck.js'
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


import CanvasDraw from 'react-canvas-draw';

//config
firebase.initializeApp({
  //Config

})

const auth = firebase.auth();
const firestore = firebase.firestore();
// const hey = React.createRef();
// console.log(hey);


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        hey <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
        <DrawCanvas />
      </section>
    </div>
  );
}

function DrawCanvas() {
  //canvas referen
  let can = null;
  const [drawing_value, set_drawing_string] = useState('');

  const messagesRef = firestore.collection('messages');

  const send_message = async (e) => {
    e.preventDefault();

    const user_info = auth.currentUser;
    console.log(user_info);
    await messagesRef.add({
      msg: drawing_value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      id: user_info.uid,
      image: true,
      user: user_info.displayName

      //PHOTOURL for later
    });
    console.log(can);
    can.clear();
  }
  return (
    <div>
      <form onSubmit={send_message}>
        <CanvasDraw 
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

  const send_message = async (e) => {
    //no refresh
    e.preventDefault();

    const user_info = auth.currentUser;
    await messagesRef.add({
      msg: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      id: user_info.uid,
      image: false,
      user: user_info.displayName
      //PHOTOURL for later
    });

    setFormValue('');
  }
  return (<>
    <div>
      {messages && messages.map(msg => <ChatMessage key={msg.id} options={msg} />)}
      <form onSubmit={send_message}>
        write something
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type='Submit'> Send  </button>
      </form>
    </div>
  </>)
}

// function DrawingSomething(data, canvas){
//   console.log(' in drawin', data, canvas);
//   return <div>
//     <p>
//       {/* {canvas.loadSaveData(data.msg)} */}
//       hi
//       </p></div>
// }

//why does htis get called twoit
function ChatMessage(props) {
  console.log(props);
  const vice = '20000px';
  const message_properties = props.options;
  const message = message_properties.id === auth.currentUser.uid ? 'sent' : 'received';
  //If it 
  if (message_properties.image) {
    return <div>
        {message_properties.user}
        <ErrorBoundary>
        <CanvasDraw 
        propTypes = {{
          canvasWidth: '10px',
          canvasHeight: '10px'
        }}
        canvasWidth = {200}
        canvasHeight = {200}
        style = {{
          // width: '150px',
          // height: '150px'
        }} disabled hideGrid ref={canvasDraw => {
          if (!canvasDraw) {
            return null;
          }
          if (message_properties.msg) {

            //Canvasdraw loses its reference, find a way to avoid making nested ifs: https://reactjs.org/docs/refs-and-the-dom.html#refs-and-functional-components
           
            console.log(canvasDraw);
            // canvasDraw.setCanvasSize(canvasDraw ? canvasDraw : null, 50,50);
            canvasDraw.loadSaveData(message_properties.msg);
          }
        }} />
        </ErrorBoundary>

    </div>;
  }
  console.log(message_properties.user);
  return <div className={`${message}`}>
    <p>{message_properties.user}: {message_properties.msg}</p>
  </div>
}

export default App;
