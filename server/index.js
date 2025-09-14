// server/server.js
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // allow all for now, tighten later
  },
  path: "/socket.io",
});

let boardMembers = [];
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-board", ({ id, profile }) => {
    console.log(id, profile, "backend");

    if (!id || !profile?.id || !profile?.name) {
      return;
    }

    socket.join(id);
    userSockets.set(profile.id, socket.id);

    const alreadyJoined = boardMembers.some(
      (member) => member.id === profile.id && member.boardId === id
    );

    if (!alreadyJoined) {
      boardMembers.push({
        id: profile.id,
        name: profile.name,
        boardId: id,
      });
    }

    const allMembersInBoard = boardMembers.filter(
      (member) => member.boardId === id
    );

    io.to(socket.id).emit("existing-members", allMembersInBoard);
    socket.broadcast.to(id).emit("member-joined", { newMember: profile });

    socket.data.boardId = id;
    socket.data.userId = profile.id;

    console.log(`User ${profile.id} joined board ${id}`);
  });

  socket.on("disconnect", () => {
    const { boardId, userId } = socket.data;
    if (!boardId || !userId) return;

    boardMembers = boardMembers.filter(
      (member) => !(member.id === userId && member.boardId === boardId)
    );

    socket.broadcast.to(boardId).emit("member-left", { userId });

    console.log(`User ${userId} left board ${boardId}`);
  });

  socket.on("kick-member", ({ boardId, id }) => {
    if (!boardId || !id) return;
    console.log(boardId, id, "coming");

    const kickedMember = boardMembers.find(
      (member) => member.boardId === boardId && member.id === id
    );

    if (!kickedMember) return;

    boardMembers = boardMembers.filter(
      (member) => !(member.boardId === boardId && member.id === id)
    );

    io.to(boardId).emit("member-kicked", { kickedMemberId: id });

    const kickedSocketId = userSockets.get(id);
    if (kickedSocketId) {
      io.to(kickedSocketId).disconnectSockets(true);
      userSockets.delete(id);
    }

    console.log(`Host kicked user ${id} from board ${boardId}`);
  });

  socket.on("end-session", ({ boardId, hostId }) => {
    if (!boardId || !hostId) return;

    console.log(`Host ${hostId} ending session for board ${boardId}`);

    boardMembers = boardMembers.filter(
      (member) => member.boardId !== boardId
    );

    io.to(boardId).emit("session-ended", { boardId });

    const socketsInRoom = io.sockets.adapter.rooms.get(boardId);
    if (socketsInRoom) {
      socketsInRoom.forEach((socketId) => {
        const s = io.sockets.sockets.get(socketId);
        if (s) {
          s.leave(boardId);
        }
      });
    }

    console.log(`Session ended for board ${boardId}`);
  });

  socket.on("update-shape", ({ boardId, shape }) => {
    if (!boardId || !shape) return;
    console.log(boardId, shape, "coming");

    socket.broadcast.to(boardId).emit("shape-updated", shape);
    console.log(`Shape updated in board ${boardId}`, shape);
  });

  socket.on("shape-deleted", ({ objectId, boardId }) => {
    if (!objectId || !boardId) return;

    socket.broadcast.to(boardId).emit("shape-removed", objectId);
  });

  socket.on("drawing-update", ({ boardId, enable }) => {
    if (!boardId) return;

    console.log(enable, "backneds");

    socket.broadcast.to(boardId).emit("drawing-toggle", enable);
  });

  socket.on("add-canva", ({ boardId, canva }) => {
    if (!boardId) return;
    console.log(boardId, canva, "cnva coming");

    io.to(boardId).emit("canva-added", canva);
  });

  socket.on("switch-canvas", ({ boardId, index }) => {
    if (!boardId || typeof index !== "number") return;
    socket.broadcast.to(boardId).emit("canvas-switched", { index });
  });

  socket.on("can-draw", ({ boardId, id, allowed }) => {
    if (!boardId || !id) return;
    console.log(boardId, id, "coming");

    io.to(boardId).emit("drawing-enabled", { userId: id, allowed });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
