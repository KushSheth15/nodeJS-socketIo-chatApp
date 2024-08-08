import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Box, Button, Container, Stack, TextField, Typography } from '@mui/material';

const App = () => {
  const socket = useMemo(() => io('http://localhost:4545'), []);
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMessage = {
      message,
      room,
      senderId: socketId,
      timestamp: new Date().toISOString()
    };
    socket.emit('message', newMessage);
    setMessage("");
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
      console.log('Connected to server');
    });

    socket.on("receive-message", (data) => {
      console.log("Received message:", data);
      if (data.message && data.senderId && data.timestamp) {
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        console.log("Invalid message data received:", data);
      }
    });

    socket.on('welcome', (s) => {
      console.log(s);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ padding: 2, borderBottom: '1px solid #ddd' }}>
        <Typography variant='h5' component="div" gutterBottom>
          Chat Application
        </Typography>
      </Box>

      <form onSubmit={joinRoomHandler}>
        <Typography variant='h6' component="div" gutterBottom>Join Room</Typography>
        <TextField
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          id='room-name'
          label="Room Name"
          variant='outlined'
          fullWidth
          margin="normal"
        />
        <Button type='submit' variant='contained' color='primary'>Join</Button>
      </form>
      
      <Box sx={{ padding: 2, borderBottom: '1px solid #ddd' }} />

      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id='message'
          label="Message"
          variant='outlined'
          fullWidth
          margin="normal"
        />
        <TextField
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          id='room'
          label="Room"
          variant='outlined'
          fullWidth
          margin="normal"
        />
        <Button type='submit' variant='contained' color='primary' fullWidth>Send</Button>
      </form>

      <Stack spacing={2} mt={4}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              textAlign: msg.senderId === socketId ? 'right' : 'left',
              backgroundColor: msg.senderId === socketId ? '#DCF8C6' : '#FFF',
              padding: '10px',
              borderRadius: '10px',
              maxWidth: '60%',
              alignSelf: msg.senderId === socketId ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <Typography variant='body1' component="div" gutterBottom>
              {msg.message}
            </Typography>
            <Typography variant='caption' component="div">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default App;
