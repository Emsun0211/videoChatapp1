import React, { useEffect, useRef, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

import Peer from "peerjs";

const Chat = ({ room, username, socket }) => {
	// const [remotePeerValue, setRemotePeerValue] = useState(null);
	const [peerId, setpeerID] = useState(null);
	const [currentMsg, setcurrentMsg] = useState("");
	const [messageList, setMessageList] = useState([]);
	const [onVideo, setOnVideo] = useState(true);
	const [onaudio, setonaudio] = useState(true);
	const [myVideoStream, setMyVideoStream] = useState(null);
	const [callersname, setCallersName] = useState("");

	const remoteVideos = useRef({});
	const localVideo = useRef();
	const currentPeerRef = useRef();

	const handleToggleAudio = () => {
		const enabled = myVideoStream.getAudioTracks()[0].enabled;
		if (enabled === true) {
			myVideoStream.getAudioTracks()[0].enabled = false;
			setonaudio(false);
		} else {
			myVideoStream.getAudioTracks()[0].enabled = true;
			setonaudio(true);
		}
	};

	const handleToggleVideo = () => {
		const enabled = myVideoStream.getVideoTracks()[0].enabled;
		if (enabled === true) {
			myVideoStream.getVideoTracks()[0].enabled = false;
			setOnVideo(false);
		} else {
			myVideoStream.getVideoTracks()[0].enabled = true;
			setOnVideo(true);
		}
	};
	const handlesendMessage = async () => {
		if (currentMsg !== "") {
			const msgData = {
				message: currentMsg,
				username: username,
				time:
					new Date(Date.now()).getHours() +
					":" +
					new Date(Date.now()).getMinutes(),
			};
			await socket.emit("message", msgData);
			// setMessageList((prevMessage) => [...prevMessage, msgData]);
			setcurrentMsg("");
		}
	};
	useEffect(() => {
		var peer = new Peer(undefined, {
			path: "/peerjs",
			host: "/",
			port: "5000",
		});
		peer.on("open", function (id) {
			console.log("My peer ID is: " + id);
			setpeerID(id);
			socket.emit("join-room", room, id, username);
		});

		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setMyVideoStream(stream);
				localVideo.current.srcObject = stream;
				localVideo.current.play();
				peer.on("call", (call) => {
					call.answer(stream);
					call.on("stream", function (remoteStream) {
						// Show stream in some video/canvas element.
						remoteVideos.current.srcObject = remoteStream;
						remoteVideos.current.play();
					});
				});
			});

		socket.on("user-connected", (userId) => {
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: true })
				.then((stream) => {
					setMyVideoStream(stream);
					localVideo.current.srcObject = stream;
					localVideo.current.play();
					var call = currentPeerRef.current.call(userId, stream);
					call.on("stream", function (remoteStream) {
						// Show stream in some video/canvas element.
						remoteVideos.current.srcObject = remoteStream;
						remoteVideos.current.play();
					});
				});
		});

		currentPeerRef.current = peer;
		return () => {
			peer.destroy();
		};
	}, []);

	useEffect(() => {
		const receiveMessage = (data) => {
			setMessageList((prevMessage) => [...prevMessage, data]);
		};
		socket.on("createMessage", receiveMessage);
		return () => {
			socket.off("createMessage", receiveMessage);
		};
	}, [socket]);

	return (
		<div>
			<div className='header'>
				<div className='logo'>
					<div className='header__back'>
						<i className='fas fa-angle-left' />
					</div>
					<h3>Video Chat</h3>
				</div>
			</div>
			<div className='main'>
				<div className='main__left'>
					<div className='videos__group'>
						<div id='video-grid'>
							<div>
								{/* <h1 style={{ color: "white" }}>{username}</h1> */}
								<video ref={remoteVideos} autoPlay />
							</div>

							<div>
								{/* <h1 style={{ color: "white" }}>{username}</h1> */}
								<video ref={localVideo} autoPlay />
							</div>
						</div>
					</div>
					<div className='options'>
						<div className='options__left'>
							<div
								id='stopVideo'
								style={{ backgroundColor: `${onaudio} ? 'red' : ''` }}
								className='options__button'
								onClick={() => handleToggleVideo()}>
								{onVideo ? (
									<i className='fa fa-video-camera' />
								) : (
									<i class='fas fa-video-slash'></i>
								)}
							</div>
							<div
								id={` muteButton `}
								style={{ backgroundColor: `${onaudio} ? 'red' : ''` }}
								className='options__button'
								onClick={() => handleToggleAudio()}>
								{onaudio ? (
									<i className='fa fa-microphone' />
								) : (
									// <i class='fas fa-video-slash'></i>
									<i class='fas fa-microphone-slash'></i>
								)}
							</div>
							<div id='showChat' className='options__button'>
								<i className='fa fa-comment' />
							</div>
						</div>
						<div className='options__right'>
							<div id='inviteButton' className='options__button'>
								<i className='fas fa-user-plus' />
							</div>
						</div>
					</div>
				</div>
				<div className='main__right'>
					{/* <div className='main__chat_window'>
						<div className='chat-body'>
							{messageList.map((msg, idx) => {
								console.log(msg);
								return (
									<div
										className='message'
										id={username === msg.author ? "you" : "other"}>
										<div>
											<div className='message-content'>
												<p>{msg.message}</p>
											</div>
											<div className='message-meta'>
												<p id='time'>{msg.time}</p>
												<p id='author'>{msg.username}</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div> */}

					<div className='chat-window'>
						<div className='chat-header'>
							<p>Live Chat</p>
						</div>
						<div className='chat-body'>
							<ScrollToBottom className='message-container'>
								{messageList.map((msg, idx) => {
									return (
										<div
											className='message'
											id={username === msg.username ? "you" : "other"}>
											<div>
												<div className='message-content'>
													<p>{msg.message}</p>
												</div>
												<div className='message-meta'>
													<p id='time'>{msg.time}</p>
													<p id='author'>{msg.username}</p>
												</div>
											</div>
										</div>
									);
								})}
							</ScrollToBottom>
						</div>
						<div className='chat-footer'>
							<input
								type='text'
								value={currentMsg}
								placeholder='Hey'
								onChange={(e) => setcurrentMsg(e.target.value)}
								onKeyPress={(e) => {
									e.key === "Enter" && handlesendMessage();
								}}
							/>
							<button onClick={handlesendMessage}>&#9658;</button>
						</div>
					</div>
					{/* </ScrollToBottom> */}
					{/* <div className='main__message_container'>
						<input
							id='chat_message'
							value={currentMsg}
							type='text'
							autoComplete='off'
							placeholder='Type message here...'
							onChange={(e) => setcurrentMsg(e.target.value)}
						/>
						<div
							id='send'
							className='options__button'
							onClick={() => handlesendMessage(currentMsg)}>
							<i className='fa fa-plus' aria-hidden='true' />
						</div>
					</div> */}
				</div>
			</div>
		</div>
	);
};

export default Chat;
