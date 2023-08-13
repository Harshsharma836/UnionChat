import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const App = () => {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token") || false);
  const [room, setRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const roomInputRef = useRef(null);
  const newRoomInputRef = useRef(null);

  const fetchAvailableRooms = async () => {
    const db = getFirestore();
    const messagesCollection = collection(db, "messages");

    try {
      const q = query(messagesCollection, where("room", "!=", ""));
      const querySnapshot = await getDocs(q);
      const uniqueRoomNames = new Set();
      querySnapshot.forEach((doc) => {
        const roomName = doc.data().room;
        if (roomName) {
          uniqueRoomNames.add(roomName);
        }
      });
      setAvailableRooms(Array.from(uniqueRoomNames));
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchAvailableRooms();
    }
  }, [isAuth]);

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
  };

  const handleEnterChat = (selectedRoom) => {
    setRoom(selectedRoom);
  };

  const handleCreateRoom = async () => {
    const newRoomName = newRoomInputRef.current.value.trim();

    if (newRoomName) {
      const db = getFirestore();
      const messagesCollection = collection(db, "messages");

      try {
        await addDoc(messagesCollection, {
          room: newRoomName,
        });
        newRoomInputRef.current.value = "";
        fetchAvailableRooms();
        setRoom(newRoomName);
      } catch (error) {
        console.error("Error creating room:", error);
      }
    }
  };

  return (
<div className="App">
      <div className="app-header">
        <h1>Union Chat</h1>
      </div>
      {!isAuth ? (
        <Auth setIsAuth={setIsAuth} />
      ) : (
        <>
          {room ? (
            <Chat room={room} />
          ) : (
            <div className="room">
              <div className="room-selection">
                <label>Create Your Own Room:</label>
                <input ref={newRoomInputRef} placeholder="Enter room name" />
                <button onClick={handleCreateRoom}>Create Room</button>
              </div>
              <div className="room-list">
                <h3>Available Chat Rooms:</h3>
                <ul>
                  {availableRooms.map((roomName, index) => (
                    <li key={index} onClick={() => handleEnterChat(roomName)}>
                      {roomName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="sign-out">
            <button onClick={signUserOut}>Sign Out</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
