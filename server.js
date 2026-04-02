const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://likeweb123.netlify.app'
  ]
}));

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

  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function ensureProductExists(db, productId) {
  if (!db.products[productId]) {
    db.products[productId] = {
      count: 0,
      likedUsers: []
    };
  }
}

app.get('/api/likes/state', (req, res) => {
  const { productId, userId } = req.query;

  if (!productId || !userId) {
    return res.status(400).json({
      message: 'productId and userId are required'
    });
  }

  const db = readDB();
  ensureProductExists(db, productId);

  const product = db.products[productId];
  const likedByCurrentUser = product.likedUsers.includes(userId);

  writeDB(db);

  res.json({
    count: product.count,
    likedByCurrentUser
  });
});

app.post('/api/likes/toggle', (req, res) => {
  const { productId, userId } = req.body;

  if (!productId || !userId) {
    return res.status(400).json({
      message: 'productId and userId are required'
    });
  }

  const db = readDB();
  ensureProductExists(db, productId);

  const product = db.products[productId];
  const userIndex = product.likedUsers.indexOf(userId);

  let likedByCurrentUser = false;

  if (userIndex === -1) {
    product.likedUsers.push(userId);
    product.count += 1;
    likedByCurrentUser = true;
  } else {
    product.likedUsers.splice(userIndex, 1);
    product.count = Math.max(0, product.count - 1);
    likedByCurrentUser = false;
  }

  writeDB(db);

  res.json({
    count: product.count,
    likedByCurrentUser
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});