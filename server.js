// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, JS, images)
app.use(express.static(path.join(__dirname)));

// uploads folder for avatars
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const upload = multer({ storage });

// Upload endpoint: returns { url }
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});
app.use('/uploads', express.static(UPLOAD_DIR));

// In-memory state (simple)
const players = {};       // socketId -> { id, name, x, y, avatarUrl, sims }
const pendingBattles = {}; // battleId -> { a, b, state }

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('newPlayer', (data = {}) => {
    players[socket.id] = {
      id: socket.id,
      name: data.name || 'Guest',
      x: data.x || 0,
      y: data.y || 0,
      avatarUrl: data.avatarUrl || '',
      sims: data.sims || []
    };
    // send existing players to new client
    socket.emit('updatePlayers', players);
    // notify others of new player
    socket.broadcast.emit('playerJoined', players[socket.id]);
    console.log('player added', socket.id, players[socket.id].name);
  });

  socket.on('playerMove', (pos) => {
    if (!players[socket.id]) return;
    players[socket.id].x = pos.x;
    players[socket.id].y = pos.y;
    socket.broadcast.emit('playerMoved', { id: socket.id, x: pos.x, y: pos.y });
  });

  socket.on('requestPlayers', () => {
    socket.emit('updatePlayers', players);
  });

  // challenge flow: sender emits { targetId }
  socket.on('challengePlayer', ({ targetId }) => {
    if (!players[targetId] || !players[socket.id]) {
      socket.emit('challengeFailed', { reason: 'target-offline' });
      return;
    }
    const battleId = `${socket.id}-${targetId}-${Date.now()}`;
    pendingBattles[battleId] = { a: socket.id, b: targetId, state: 'invited' };
    io.to(targetId).emit('battleInvite', { from: socket.id, fromName: players[socket.id].name, battleId });
    socket.emit('challengeSent', { battleId, targetId });
  });

  socket.on('respondToBattle', ({ battleId, accept }) => {
    const b = pendingBattles[battleId];
    if (!b) return;
    const sender = b.a, target = b.b;
    if (!accept) {
      io.to(sender).emit('battleDeclined', { battleId, by: socket.id });
      delete pendingBattles[battleId];
      return;
    }
    // accepted
    b.state = 'accepted';
    io.to(sender).emit('battleAccepted', { battleId, by: socket.id });
    io.to(target).emit('battleAccepted', { battleId, by: socket.id });
    // (Optional) initialize server-side battle state here for authoritative resolution
  });

  socket.on('disconnect', () => {
    console.log('socket disconnect', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

