const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

function createDefaultDB() {
  return {
    products: {}
  };
}

function readDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createDefaultDB(), null, 2));
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function ensureProductExists(db, productId) {
  if (!db.products[productId]) {
    db.products[productId] = {
      likedUsers: []
    };
  }

  if (!Array.isArray(db.products[productId].likedUsers)) {
    db.products[productId].likedUsers = [];
  }
}

app.get('/', (req, res) => {
  res.send('Like backend is running');
});

app.get('/api/likes/state', (req, res) => {
  const { productId, userId } = req.query;

  if (!productId || !userId) {
    return res.status(400).json({
      error: 'productId and userId are required'
    });
  }

  const db = readDB();
  ensureProductExists(db, productId);

  const likedUsers = db.products[productId].likedUsers;
  const likedByCurrentUser = likedUsers.includes(userId);
  const count = likedUsers.length;

  writeDB(db);

  res.json({
    count,
    likedByCurrentUser
  });
});

app.post('/api/likes/toggle', (req, res) => {
  const { productId, userId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({
      error: 'productId and userId are required'
    });
  }

  const db = readDB();
  ensureProductExists(db, productId);

  const likedUsers = db.products[productId].likedUsers;
  const existingIndex = likedUsers.indexOf(userId);

  let likedByCurrentUser = false;

  if (existingIndex === -1) {
    likedUsers.push(userId);
    likedByCurrentUser = true;
  } else {
    likedUsers.splice(existingIndex, 1);
    likedByCurrentUser = false;
  }

  writeDB(db);

  res.json({
    count: likedUsers.length,
    likedByCurrentUser
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});