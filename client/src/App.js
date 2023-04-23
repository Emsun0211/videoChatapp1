import "./App.css";
import io from "socket.io-client";
import { useRef, useState } from "react";
import Chat from "./Chat/Chat";
import Peer from "peerjs";
const socket = io.connect("http://localhost:5000");

function App() {
	const [peerId, setpeerID] = useState(null);
	const [username, setusername] = useState("");
	const [room, setRoom] = useState("");
	const [showChat, setShowChat] = useState(false);
	const currentPeerRef = useRef();

	const joinRoom = () => {
		if (room !== "" && username !== "") {
			setShowChat(true);
		}
	};

	return (
		<div className=''>
			{!showChat ? (
				<div className='App'>
					<div className='joinChatContainer'>
						<h3>Join Chat</h3>
						<input
							type='text'
							placeholder='John..'
							onChange={(e) => setusername(e.target.value)}
						/>
						<input
							type='text'
							placeholder='Room ID'
							onChange={(e) => setRoom(e.target.value)}
						/>
						<button onClick={joinRoom}>Join A room</button>
					</div>
				</div>
			) : (
				<Chat
					username={username}
					room={room}
					peer={currentPeerRef}
					peerId={peerId}
					socket={socket}
				/>
			)}
		</div>
	);
}

export default App;
