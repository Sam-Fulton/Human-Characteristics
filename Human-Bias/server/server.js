const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const trueskill = require('trueskill');

const app = express();
const port = 5000;
const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:5000/callback';
const driveScope = 'https://www.googleapis.com/auth/drive';

const serviceAccountKey = require('./credentials/service-account-key.json');

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

const jwtClient = new google.auth.JWT(
  serviceAccountKey.client_email,
  null,
  serviceAccountKey.private_key,
  driveScope
);

const driveServiceAccount = google.drive({ version: 'v3', auth: jwtClient });

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

    tokenStore = { tokens, 'userId': userId };
    console.log(tokenStore);

    res.redirect('/rank');
  } catch (error) {
    console.error('Error handling authorization code:', error);
    res.status(500).send('Internal Server Error');
  }
});

function getAccessToken(code) {
  return oauth2Client.getToken(code);
}

function getUserIdFromIdToken(idToken) {
  const decodedToken = jwt.decode(idToken);
  return decodedToken.sub;
}
let imageRankings = {};
let imageList = [];

app.post('/upload-to-drive', async (req, res) => {
  const { content } = req.body;
  const userId = content.userId;

  try {
    const folderExists = await doesFolderExist(driveServiceAccount, 'ranking-output');
    if (!folderExists) {
      await createFolder(driveServiceAccount, 'ranking-output');
    }

    const folderId = await getFolderId(driveServiceAccount, 'ranking-output');

    // Retrieve existing rankings or initialize if not present
    const existingRankings = imageRankings[userId] || {};
    const trueskillRankings = calculateTrueSkillRankings(existingRankings, content.images);

    // Update in-memory rankings for the user
    imageRankings[userId] = trueskillRankings;

    // Update content with TrueSkill rankings
    content.rankings = trueskillRankings;

    const response = await driveServiceAccount.files.create({
      requestBody: {
        name: `${userId}.json`,
        mimeType: 'application/json',
        parents: [folderId],
      },
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(content),
      },
    });

    console.log('File uploaded successfully:', response.data);

    // Generate the updated list of images based on TrueSkill rankings
    imageList = generateUpdatedImages(trueskillRankings);

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

function calculateTrueSkillRankings(existingRankings, userRankings) {
  // Combine existing rankings with user rankings
  const allRankings = { ...existingRankings, ...userRankings };

  // Convert rankings to TrueSkill format
  const players = Object.keys(allRankings).map(playerId => ({
    id: playerId,
    skill: ts.createRating(allRankings[playerId]),
  }));

  // Perform TrueSkill update
  const updatedPlayers = ts.update(players);

  // Extract updated rankings
  const updatedRankings = {};
  updatedPlayers.forEach(player => {
    updatedRankings[player.id] = ts.expose(player.skill);
  });

  return updatedRankings;
}

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

async function listFiles() {
  try {
    const response = await driveServiceAccount.files.list({
      q: "'root' in parents",
    });

    const files = response.data.files;
    console.log('Files in the root directory:', files);
  } catch (error) {
    console.error('Error listing files:', error);
  }
}

app.get('/rank', (req, res) => {
  res.sendFile(path.join(__dirname, '../main.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
