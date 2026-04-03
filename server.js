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

  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function ensureProductExists(db, productId) {
  if (!db.products[productId]) {
    db.products[productId] = { likes: 0 };
  }
}

app.get('/', (req, res) => {
  res.send('Like backend is running');
});

app.get('/likes/:productId', (req, res) => {
  const { productId } = req.params;
  const db = readDB();

  ensureProductExists(db, productId);
  writeDB(db);

  res.json({ likes: db.products[productId].likes });
});

app.post('/likes/:productId', (req, res) => {
  const { productId } = req.params;
  const db = readDB();

  ensureProductExists(db, productId);
  db.products[productId].likes += 1;
  writeDB(db);

  res.json({ likes: db.products[productId].likes });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
