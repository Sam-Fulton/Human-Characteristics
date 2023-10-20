const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.get('/public/javascript/:file', (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, `../public/javascript/${fileName}`);
  res.sendFile(filePath);
});

app.get('/public/css/:file', (req, res) => {
  const fileName = req.params.file;
  const filePath = path.join(__dirname, `../public/css/${fileName}`);
  res.sendFile(filePath);
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
