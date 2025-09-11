import {Server as NetServer} from "http";
import { NextApiRequest } from "next";
import {Server as ServerIo} from "socket.io";
import { NextApiResponseServerIo } from "@/next-auth";

type Guest = {
    id:string,
    name:string,
    boardId:string
}
let boardMembers:Guest[] = []
const userSockets = new Map<string, string>();

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req:NextApiRequest, res: NextApiResponseServerIo) => {
    if(!res.socket.server.io){
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIo(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

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
            member => member.id === profile.id && member.boardId === id
        );

        if (!alreadyJoined) {
            boardMembers.push({
            id: profile.id,
            name: profile.name,
            boardId: id
            });
        }

        const allMembersInBoard = boardMembers.filter(
            member => member.boardId === id
        );

                io.to(socket.id).emit('existing-members', allMembersInBoard); // Send full list to the new member
                socket.broadcast.to(id).emit("member-joined", { newMember: profile });

                // Save for cleanup
                socket.data.boardId = id;
                socket.data.userId = profile.id;

                console.log(`User ${profile.id} joined board ${id}`);
                });
        
                   socket.on("disconnect", () => {
                    const { boardId, userId } = socket.data; // we saved these on join
                    if (!boardId || !userId) return;

                    // Remove from boardMembers
                    boardMembers = boardMembers.filter(
                        member => !(member.id === userId && member.boardId === boardId)
                    );

                    // Tell others this user left
                    socket.broadcast.to(boardId).emit("member-left", { userId });

                    console.log(`User ${userId} left board ${boardId}`);
                    });

                socket.on("kick-member", ({boardId, id}) => {
                    if(!boardId || !id) return;
                    console.log(boardId, id, "coming")

                    const kickedMember = boardMembers.find(
                    (member) => member.boardId === boardId && member.id === id
                );

                if (!kickedMember) return;

                 boardMembers = boardMembers.filter(
                    (member) => !(member.boardId === boardId && member.id === id)
                );

                // socket.to(boardId).emit("member-kicked", { kickedMemberId:id});
                  io.to(boardId).emit("member-kicked", { kickedMemberId: id });

                const kickedSocketId = userSockets.get(id);
                if (kickedSocketId) {
                    io.to(kickedSocketId).disconnectSockets(true); // Force disconnect
                    userSockets.delete(id);
                }

                console.log(`Host kicked user ${id} from board ${boardId}`);
                })

                socket.on("end-session", ({ boardId, hostId }) => {
                if (!boardId || !hostId) return;
                
                console.log(`Host ${hostId} ending session for board ${boardId}`);
                
                // Remove all members from this board
                boardMembers = boardMembers.filter(member => member.boardId !== boardId);
                
                // Notify all users in the board that session has ended
                io.to(boardId).emit("session-ended", { boardId });
                
                // Disconnect all sockets in this board room
                const socketsInRoom = io.sockets.adapter.rooms.get(boardId);
                if (socketsInRoom) {
                    socketsInRoom.forEach(socketId => {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.leave(boardId);
                        }
                    });
                }
                
                console.log(`Session ended for board ${boardId}`);
            });

                socket.on("update-shape", ({ boardId, shape }) => {
                if (!boardId || !shape) return;
                console.log(boardId, shape, "coming")


                // Broadcast to all others in the same room
                socket.broadcast.to(boardId).emit("shape-updated", shape);
                console.log(`Shape updated in board ${boardId}`, shape);
                });
                

            //     socket.on("sync-history", ({ boardId, canvasId, canvasState }) => {
            //     // io.to(boardId).emit("history-synched", { canvasId, canvasState });
                
            //     socket.broadcast.to(boardId).emit("history-synched", { canvasId, canvasState });
            // });
            
            // // ✅ CHANGED: Use socket.to instead of io.to
            // socket.on("canvas-undo", ({ boardId, canvasId}) => {
            //     // io.to(boardId).emit("undo-canva", { canvasId}); // ✅ CHANGED: Only to others
            //     socket.broadcast.to(boardId).emit("undo-canva", { canvasId});
            // });
            
            // // ✅ CHANGED: Use socket.to instead of io.to
            // socket.on("canvas-redo", ({ boardId, canvasId }) => {
            //     // io.to(boardId).emit("redo-canva", { canvasId }); // ✅ CHANGED: Only to others
            //     socket.broadcast.to(boardId).emit("redo-canva", { canvasId });
            //     });


                socket.on("shape-deleted", ({objectId, boardId}) => {
                    if(!objectId ||!boardId) return;

                    socket.broadcast.to(boardId).emit("shape-removed", objectId)
                })

                socket.on("drawing-update", ({boardId, enable}) => {
                    if(!boardId) return;

                    console.log(enable, "backneds")

                    socket.broadcast.to(boardId).emit("drawing-toggle", enable)
                })

                socket.on("add-canva", ({boardId, canva}) => {
                    if(!boardId) return;
                    console.log(boardId, canva, "cnva coming")

                    io.to(boardId).emit('canva-added', canva)
                })

                socket.on("switch-canvas", ({ boardId, index }) => {
                if (!boardId || typeof index !== "number") return;
                socket.broadcast.to(boardId).emit("canvas-switched", { index });
                });

                socket.on('can-draw', ({boardId, id, allowed})  => {
                     if(!boardId || !id) return;
                    console.log(boardId, id, "coming")

                    io.to(boardId).emit('drawing-enabled', {userId: id, allowed})
                })
            })
        
        res.socket.server.io = io;
    }
    
    res.end();
}

export default ioHandler;
