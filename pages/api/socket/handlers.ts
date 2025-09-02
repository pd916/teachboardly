// import { Server as ServerIo, Socket } from "socket.io";

// export function registerHandlers(io: ServerIo, socket: Socket) {
//   socket.on("join-board", (boardId: string) => {
//     socket.join(boardId);
//     console.log(`Socket ${socket.id} joined board ${boardId}`);
//   }); 
// }

// //  socket.on("join-board", (boardId: string) => {
// //     socket.join(boardId);
// //     console.log(`Socket ${socket.id} joined board: ${boardId}`);
// //   });

// //   // When a new member is added, emit to all clients in the board room
// //   socket.on("new-member", ({ boardId, member }) => {
// //     console.log(`New member joined board ${boardId}:`, member);
// //     io.to(boardId).emit("member-joined", member);
// //   });

// //   // Optional: On disconnect
// //   socket.on("disconnect", () => {
// //     console.log(`Socket ${socket.id} disconnected`);
// //   });