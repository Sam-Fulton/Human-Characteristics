const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/rank', (req, res) => {
  res.sendFile(path.join(__dirname, '../main.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
