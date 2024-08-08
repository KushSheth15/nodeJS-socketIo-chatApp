import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';
import {createServer} from 'http';
import cors from 'cors';

const app = express();

dotenv.config();

const PORT = process.env.PORT;

const server = createServer(app);

const io = new Server(server,{
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

app.use(cors());

io.on("connection",(socket)=>{
    console.log('User connected',socket.id);

    socket.on("message",({room, message, senderId, timestamp})=>{
    
    if (room && message && senderId && timestamp) {
      io.to(room).emit("receive-message", { message, senderId, timestamp });
    } else {
      console.log('Invalid data received:', { room, message, senderId, timestamp });
    }
    })

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected',socket.id);
    });
})

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})