const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const app = express();
const port = 5000;
const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

const driveAuth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/drive',
});
const driveService = google.drive({ version: 'v3', auth: driveAuth });

app.post('/upload-to-drive', async (req, res) => {
  try {
    const { userId, label1, label2, images } = req.body;

    const content = {
      userId: userId,
      label1: label1,
      label2: label2,
      images: [],
    };

    images.forEach((image) => {
      content.images.push({
        index: image.index,
        filename: image.filename,
      });
    });

    const fileContent = JSON.stringify(content);

    const file = await driveService.files.create({
      requestBody: {
        name: `user_${userId}.json`,
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: fileContent,
      },
    });

    console.log('File uploaded successfully:', file.data);

    res.json({ success: true, fileId: file.data.id });
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/handle-token', async (req, res) => {
  const { token } = req.body;

  try {
    console.log('server token: ' + token)
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;
    const userName = payload.name;
    const userEmail = payload.email;

    console.log("ID: " + userId);
    console.log('Full Name: ' + userName);
    console.log('Email: ' + userEmail);

    res.json({ success: true, userId, userName, userEmail });
  } catch (error) {
    console.error('Error decoding token:', error);
    res.status(400).json({ success: false, error: 'Invalid token' });
  }
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
