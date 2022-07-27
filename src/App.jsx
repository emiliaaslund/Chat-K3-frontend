import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";
// import Chat from "../components/Chat";

let socket;

function App() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [user, setUser] = useState([]);
  const [username, setUsername] = useState([]);
  // const [activeUsers, setActiveUsers] = useState([]);

  const [rooms, setRooms] = useState("");
  const [room, setRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const [showChat, setShowChat] = useState(false);

  // console.log(room, "room"); //noll
  // console.log(rooms, "rooms"); // alla sparade rummen
  // console.log(roomInput, "roominput"); // noll
  // console.log(username, "username");
  // console.log(message, "message"); // noll
  // console.log(messages, "messages"); // noll

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    //messages
    socket.on("sent_message", (data) => {
      console.log(data);
    });

    // socket.on("active_user", (data) => {
    //   console.log(data, "hej från active user");
    // });

    //users
    socket.on("get_users", (data) => {
      console.log(data);
      setUsername(data);
    });

    socket.on("user_created", (data) => {
      setUser(data);
      console.log(`Inloggad som ${data}`);
    });

    //rooms
    socket.on("rooms", (data) => {
      // console.log(data, "hämtar alla rum");
      setRooms(data);
    });

    //gå med i rum
    socket.on("join_room", (data) => {
      if (data) {
        console.log(data);
        socket.emit("join_room", data);
        setRoom(data);
      }
    });

    socket.on("joined_room", (data) => {
      console.log(data);
      setRoom(data);
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
      console.log(socket.room);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from server");
    });

    return () => socket.off();
  }, []);

  //***********  FUNKTIONER  **************/

  function handleUsername(username) {
    if (username) {
      socket.emit("create_user", username);
      setUsername(username);
    }
  }

  // RUM
  function createRoom(roomName) {
    if (roomInput) socket.emit("create_room", roomName);
    setRoomInput("");
  }

  function joinRoom(roomName) {
    if (roomName) {
      socket.emit("join_room", roomName);
      setUsername(username);
      setRoom(roomName);
      setShowChat(true);
    }
  }

  //CHAT
  function leaveRoom(roomName) {
    socket.emit("leave_room", roomName);
    setShowChat(false);
  }

  function handelDeleteRoom() {
    console.log("Room deleted");
  }

  //MEDDELANDEN

  function handleMessage(e, newMessage) {
    e.preventDefault();
    e.target.focus();
    socket.emit("send_message", {
      message: newMessage,
      room: roomInput,
      username: username,
    });
    setMessages(newMessage);
    console.log(newMessage, "hej från newmsg");
  }

  useEffect(() => {
    socket.on("all_rooms", (data) => {
      setRooms(data);
      console.log("hej från all_rooms");
    });
  }, [rooms]);

  return !showChat ? (
    <div className="join-container">
      <header className="join-header">
        <h1>
          <i className="fas fa-smile"></i> Real Time Chat
        </h1>
      </header>
      <main className="join-main">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button
            className="header-btn"
            onClick={() => handleUsername(username)}
          >
            Create Username
          </button>
          <div className="form-control">
            <label htmlFor="room">Room name</label>
            <input
              type="text"
              name="room"
              id="room"
              placeholder="Enter room name..."
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              required
            />
          </div>
          <button className="header-btn" onClick={() => createRoom(roomInput)}>
            Create room
          </button>
          <button className="header-btn" onClick={() => joinRoom(roomInput)}>
            Join room
          </button>
        </form>
      </main>
    </div>
  ) : (
    <div className="chat-container">
      <header className="chat-header">
        <h1>
          <i className="title"></i>Real Time Chat
        </h1>
        <div className="chat-header">
          <button className="header-btn" onClick={handelDeleteRoom}>
            Delete Room
          </button>
        </div>
        <button className="header-btn" onClick={() => leaveRoom()}>
          Leave Room
        </button>
      </header>
      <main className="chat-main">
        <div className="chat-sidebar">
          <h3>
            <i className="fas fa-comments"></i> Room Name:
          </h3>
          <h2 id="room-name">{roomInput}</h2>
          <h3>
            <i className="fas fa-users"></i> Users:
          </h3>
          <h2 id="users">{username}</h2>
        </div>

        <div className="chat-messages">
          {Array.from(messages).map((newMessage) => {
            return (
              <div className="message" key={newMessage}>
                <p className="meta">{username}</p>
                {/* <span>{message.time}</span> */}
                <p className="text">{newMessage}</p>
              </div>
            );
          })}
        </div>
      </main>
      <div className="chat-form-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            name="message"
            type="text"
            placeholder="Enter Message"
            required
            autoComplete="off"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="send-btn"
            onClick={(e) => {
              {
                handleMessage(e, newMessage);
                setNewMessage("");
              }
            }}
          >
            <i className="fas fa-paper-plane"></i> Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
