import { useEffect, useState } from "react";
// adDoc add a document to a coolections
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase-config";
import "../styles/Chat.css";

export const Chat = (props) => {
  const { room } = props;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const queryMessages = query(messagesRef, where("room", "==", room) , orderBy("createdAt"));
    const unsuscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsuscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      room,
    });

    setNewMessage("");
  };

  return(
    <div className="chat-app">
  <div className="header">
    <h2>Welcome to: {room.toUpperCase()}</h2>
  </div>
  <div className="messages">
    {messages.map((message) => (
      <div className={`message ${message.user === auth.currentUser.displayName ? "my-message" : ""}`} key={message.id}>
        <div className="message-content">
          <span className="user">{message.user}</span>
          <span className="text">{message.text}</span>
        </div>
        <div className="message-date">
          {message.createdAt instanceof Date ? (
            message.createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          ) : (
            <span className="small-date">
              {new Date(message.createdAt?.toDate()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
  <form onSubmit={handleSubmit} className="new-message-form">
    <input
      className="new-message-input"
      placeholder="Type your message here.."
      onChange={(e) => setNewMessage(e.target.value)}
      value={newMessage}
    ></input>
    <button type="submit" className="send-button">
      Send
    </button>
  </form>
</div>


  );
};
