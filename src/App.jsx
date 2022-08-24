import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

// const oldURL = "http://localhost:5000";
const newURL = "https://realtimechat-backend.herokuapp.com/";
const socket = io(newURL);

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState("");
  const [room, setRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    //messages
    socket.on("sent_message", (data) => {
      setMessages((prevState) => [...prevState, data]);
      console.log(data, "från sent message");
    });

    //users
    socket.on("get_users", (data) => {
      setUsername(data);
    });

    socket.on("user_created", (data) => {
      setUsername(data.username);
      console.log(`Username: ${data.username} has been created`);
    });

    //rooms
    socket.on("rooms", (room) => {
      setRoom(room);
      console.log(room, "från rooms");
    });

    //gå med i rum
    // socket.on("join_room", (data) => {
    //   if (data) {
    //     // console.log(data, "hej från joinrum i app");
    //     socket.emit("join_room", data);
    //     setRoom(data);
    //     setMessage("");
    //   }
    // });s

    socket.on("room_created", (room) => {
      console.log(room, "room created");
      console.log(`A new room: ${room} was created`);
      setRoom(room);
    });

    socket.on("joined_room", (room) => {
      setRoom(room);
      // console.log(room, "denna skriver ut rummet från joined room");
    });

    socket.on("leave_room", (room) => {
      socket.leave(room);
    });

    socket.on("deleted_room", (room) => {
      setRooms(room);
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
      setUsername("");
    }
  }

  // RUM
  function createRoom(room) {
    if (roomInput) socket.emit("create_room", room);
    setRoomInput("");
  }

  function joinRoom(room) {
    if (room) {
      socket.emit("join_room", room);
      // console.log(room, "console från function joinroom");
      setRoom(room);
      setShowChat(true);
    }
  }

  //CHAT
  function leaveRoom() {
    console.log(`${username} has left room: ${room}`);
    socket.emit("leave_room", room);
    setShowChat(false);
    setUsername("");
    setRoomInput("");
  }

  function handelDeleteRoom() {
    socket.emit("delete_room", room);
    console.log(`${room} has been deleted`);
    setShowChat(false);
    setRoomInput("");
    setUsername("");
  }

  //MEDDELANDEN

  function handleMessage(data) {
    const newMessage = {
      message: message,
      room: roomInput,
      username: username,
    };
    socket.emit("message", newMessage);
    if (message.length === 0) {
      console.log("Can't send empty messages");
    } else {
      setMessages([...messages, newMessage]);
      setMessage("");
      console.log(message, "från skickat msg");
    }
  }

  useEffect(() => {
    socket.on("all_rooms", (data) => {
      setRooms(data);
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
          <button className="btn" onClick={() => handleUsername(username)}>
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
          <button className="btn" onClick={() => createRoom(roomInput)}>
            Create room
          </button>
          <button className="btn" onClick={() => joinRoom(roomInput)}>
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

          <button className="header-btn" onClick={() => leaveRoom()}>
            Leave Room
          </button>
        </div>
      </header>
      <main className="chat-main">
        <div className="chat-sidebar">
          <h3>
            <i className="fas fa-comments"></i> Room:
          </h3>
          <h2 id="room-name">{roomInput}</h2>
          <h3>
            <i className="fas fa-users"></i> Your name:
          </h3>
          <h2 id="users">{username}</h2>
        </div>
        <div className="chat-messages">
          <ul>
            {messages.map((message) => {
              return (
                <li className="message">
                  <p className="meta">{message.username}</p>
                  {/* <span>{message.date}</span> */}
                  <p className="text">{message.message} </p>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <div className="chat-form-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            id="message"
            type="text"
            placeholder="Enter Message"
            required
            autoComplete="off"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="send-btn"
            onClick={() => {
              {
                handleMessage();
              }
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
