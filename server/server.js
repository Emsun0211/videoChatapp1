const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
// app.set("view engine", "ejs");
// const io = require("socket.io")(server, {
// 	cors: {
// 		origin: "*",
// 	},
// });

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});

app.use(
	cors({
		origin: "*",
	})
);
const { ExpressPeerServer } = require("peer");
const opinions = {
	debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, opinions));
// app.use(express.static("public"));
// app.use(express.json());

// app.get("/", (req, res) => {
// 	// const url = `${req.protocol}://${req.get("host")}/${uuidv4()}`;
// 	// res.status(200).send(url);
// 	res.redirect(`/${uuidv4()}`);
// });

// app.get("/:room", (req, res) => {
// 	// res.render("room", { roomId: req.params.room });
// });

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, username) => {
		console.log(`user with socketId ${userId} connected`);
		socket.join(roomId);
		console.log(roomId);

		setTimeout(() => {
			socket.to(roomId).emit("user-connected", userId);
			console.log("Adding user to the room" + roomId);
		}, 1000);
		socket.on("message", ({ message, time }) => {
			console.log(message);
			io.to(roomId).emit("createMessage", {
				message,
				username,
				time,
			});
		});
	});
});

server.listen(process.env.PORT || 5000, () =>
	console.log("Listening on port 8080")
);
