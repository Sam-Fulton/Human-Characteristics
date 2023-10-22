const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:5000/callback';
const driveScope = 'https://www.googleapis.com/auth/drive';

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

let tokenStore = {}

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/get-user-token', (req, res) => {
  if (tokenStore != {}) {
    res.json({ success: true, token: tokenStore });
  } else {
    res.json({ success: false, error: 'Token not found' });
  }
});

app.get('/authorize', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [driveScope, 'profile', 'email']
  });

  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await getAccessToken(code);
    console.log(tokens);

    const userId = getUserIdFromIdToken(tokens.id_token);

    tokenStore = {tokens, 'userId' : userId};
    console.log(tokenStore);
    
    res.redirect('/rank');
  } catch (error) {
    console.error('Error handling authorization code:', error);
    res.status(500).send('Internal Server Error');
  }
});

function getAccessToken(code) {
  const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  return oAuth2Client.getToken(code);
}

function getUserIdFromIdToken(idToken) {
  const decodedToken = jwt.decode(idToken);
  return decodedToken.sub;
}

app.post('/upload-to-drive', async (req, res) => {
  const { content } = req.body;

  try {
    if (!tokenStore.tokens || !tokenStore.tokens.access_token) {
      console.error('Access token not available. Reauthorize the user.');
      return res.status(401).json({ success: false, error: 'Authorization required' });
    }

    oauth2Client.setCredentials(tokenStore.tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.create({
      requestBody: {
        name: 'user.json',
        mimeType: 'application/json',
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
      return res.status(401).json({ success: false, error: 'Authorization required' });
    } else {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
});

const doesFolderExist = async (drive, folderName) => {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
    });
    return response.data.files.length > 0;
  } catch (error) {
    console.error('Error checking if folder exists:', error);
    throw error;
  }
};

const createFolder = async (drive, folderName) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
    });
    console.log('Folder created successfully:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

const getFolderId = async (drive, folderName) => {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
    });
    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    } else {
      throw new Error(`Folder "${folderName}" not found.`);
    }
  } catch (error) {
    console.error('Error getting folder ID:', error);
    throw error;
  }
};

app.get('/rank', (req, res) => {
  res.sendFile(path.join(__dirname, '../main.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
