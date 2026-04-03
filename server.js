app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

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

  res.json({
    count: product.count,
    likedByCurrentUser
  });
});
