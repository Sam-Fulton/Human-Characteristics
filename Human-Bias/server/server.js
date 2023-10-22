const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = 5000;
const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:5000/callback';
const driveScope = 'https://www.googleapis.com/auth/drive';

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/authorize', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [driveScope, 'profile', 'email']
  });

  res.redirect(authUrl);
});

const tokenStore = {}; // In-memory store for tokens (replace with a database in production)

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log(tokens);
    oauth2Client.setCredentials(tokens);

    // Check if id_token_payload exists before accessing its properties
    const userId = tokens.id_token_payload ? tokens.id_token_payload.sub : null;

    if (!userId) {
      console.error('Error: Unable to retrieve user ID from ID token payload');
      return res.status(500).send('Internal Server Error');
    }

    // Save the user ID to token store or wherever you need it
    tokenStore.setUserId(userId);

    // Use the OAuth 2.0 client to interact with Google Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Example: List the user's files in Google Drive
    const driveResponse = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name)',
    });

    console.log('Files in Google Drive:');
    driveResponse.data.files.forEach((file) => {
      console.log(`${file.name} (${file.id})`);
    });

    res.send('Authorization successful. Check the server console for files in Google Drive.');
  } catch (error) {
    console.error('Error handling authorization code:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.post('/upload-to-drive', async (req, res) => {
  const { content } = req.body;

  try {
      const userId = content.userId;

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const folderExists = await doesFolderExist(drive, 'ranking-output');
      if (!folderExists) {
          await createFolder(drive, 'ranking-output');
      }

      const folderId = await getFolderId(drive, 'ranking-output');

      const response = await drive.files.create({
          requestBody: {
              name: 'user.json',
              mimeType: 'application/json',
              parents: [folderId],
          },
          media: {
              mimeType: 'application/json',
              body: JSON.stringify(content),
          },
      });

      console.log('File uploaded successfully:', response.data);
      res.json({ success: true, fileId: response.data.id });
  } catch (error) {
      console.error('Error uploading file to Google Drive:', error);

      if (error.code === 401) {
          // Handle authentication errors
      } else {
          res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
  }
});


app.get('/rank', (req, res) => {
  res.sendFile(path.join(__dirname, '../main.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
