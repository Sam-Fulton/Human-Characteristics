import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const port = 5000;
const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:5000/callback';
const driveScope = 'https://www.googleapis.com/auth/drive';

import serviceAccountKey from './credentials/service-account-key.json' assert {type: "json"};

import { updateRankings } from './openskill-utils.mjs';


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

let allImageFiles = [];

app.post('/upload-to-drive', async (req, res) => {
  const content = JSON.parse(req.body.content);
  const userId = content.userId;

  try {
    const folderExists = await doesFolderExist(driveServiceAccount, `ranking_output_${userId}`);
    if (!folderExists) {
      await createFolder(driveServiceAccount, `ranking_output_${userId}`);
    }

    allImageFiles = getAllImageFiles()

    const folderId = await getFolderId(driveServiceAccount, `ranking_output_${userId}`);

    const userRankings = await fetchUserRankings(userId, folderId);

    const updatedUserRankings = updateRankings(userRankings, content.label2, content.images);

    await uploadRankings(userId, folderId, 'rankings_total.json', updatedUserRankings);

    const globalRankings = await fetchGlobalRankings();

    const updatedGlobalRankings = updateRankings(globalRankings, content.label2, content.images);

    await uploadRankings('global', null, 'rankings_total.json', updatedGlobalRankings);

    const response = await driveServiceAccount.files.create({
      requestBody: {
        name: `ranking_data_${userId}_${Date.now()}.json`,
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

function getAllImageFiles() {
  const owner = 'Sam-Fulton';
  const repo = 'human-bias-images';
  const path = 'images';

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch directory contents. Status: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        return data.map(file => file.name);
      } else {
        throw new Error('Invalid response format.');
      }
    });
}

function initialiseRankings(imageFilenames, label) {
  const initialRanking = 0;
  const rankings = { [label]: {} };

  imageFilenames.forEach((filename) => {
    rankings[label][filename] = initialRanking;
  });

  return rankings;
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

async function fetchUserRankings(userId, folderId) {
  try {
    const file = await getFileByName(driveServiceAccount, folderId, 'rankings_total.json');
    if (file) {
      const content = await downloadFile(driveServiceAccount, file.id);
      return JSON.parse(content);
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error fetching user rankings:', error);
    throw error;
  }
}

async function fetchGlobalRankings() {
  try {
    const file = await getFileByName(driveServiceAccount, null, 'rankings_total.json');
    if (file) {
      const content = await downloadFile(driveServiceAccount, file.id);
      return JSON.parse(content);
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error fetching global rankings:', error);
    throw error;
  }
}

async function uploadRankings(userId, folderId, fileName, rankings) {
  try {
    const file = await getFileByName(driveServiceAccount, folderId, fileName);
    if (file) {
      await updateFile(driveServiceAccount, file.id, JSON.stringify(rankings));
    } else {
      await createFile(driveServiceAccount, folderId, fileName, JSON.stringify(rankings));
    }
  } catch (error) {
    console.error('Error uploading rankings:', error);
    throw error;
  }
}

async function getFileByName(drive, folderId, fileName) {
  try {
    const query = folderId ? `'${folderId}' in parents` : "'root' in parents";
    const response = await drive.files.list({
      q: `name='${fileName}' and ${query}`,
    });

    if (response.data.files.length > 0) {
      return response.data.files[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting file by name:', error);
    throw error;
  }
}

async function downloadFile(drive, fileId) {
  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return new Promise((resolve, reject) => {
      let content = '';
      response.data
        .on('data', chunk => {
          content += chunk;
        })
        .on('end', () => {
          resolve(content);
        })
        .on('error', error => {
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

async function createFile(drive, folderId, fileName, content) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/json',
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: 'application/json',
        body: content,
      },
    });

    console.log('File created successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
}

async function updateFile(drive, fileId, content) {
  try {
    const response = await drive.files.update({
      fileId: fileId,
      media: {
        mimeType: 'application/json',
        body: content,
      },
    });

    console.log('File updated successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
}


