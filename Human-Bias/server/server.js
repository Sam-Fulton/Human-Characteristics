const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const app = express();
const port = 5000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

// Google Drive API setup
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/drive',
});
const driveService = google.drive({ version: 'v3', auth });

// Endpoint for handling file upload
app.post('/upload-to-drive', async (req, res) => {
  try {
    const { userId, label1, label2, images } = req.body;

    // Build content object
    const content = {
      userId: userId,
      label1: label1,
      label2: label2,
      images: [],
    };

    // Add image details to content
    images.forEach((image) => {
      content.images.push({
        index: image.index,
        filename: image.filename,
      });
    });

    // File content as JSON
    const fileContent = JSON.stringify(content);

    // Create file in Google Drive
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

// ... Rest of your existing server code

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
