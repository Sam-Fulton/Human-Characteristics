function initGoogleAPI() {
    gapi.load('client:auth2', function () {
      gapi.auth2.init({
        client_id: '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com',
      }).then(() => {
        gapi.client.init({
            apiKey: 'AIzaSyCJI2oI9likw_EY19QIgMgWCpMi7-PGq0s',
            clientId: '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com',
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: 'https://www.googleapis.com/auth/drive.file',
        });
  
        loadRandomImages(5);
      });
    });
  }
  function sendFileToGoogleDrive(userId) {
    console.log('Sending file to Google Drive...');

    const label1 = document.getElementById('label1').textContent;
    const label2 = document.getElementById('label2').textContent;

    const embedElements = document.querySelectorAll('.rank-svg embed');

    const content = {
        userId: userId,
        label1: label1,
        label2: label2,
        images: [],
    };

    embedElements.forEach(embedElement => {
        const index = embedElement.dataset.index;
        const imageUrl = embedElement.src;
        const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

        content.images.push({
            index: index,
            filename: filename,
        });
    });

    const fileContent = JSON.stringify(content);

    gapi.client.drive.files.create({
        resource: {
            name: 'user.json',
            mimeType: 'application/json',
        },
        media: {
            mimeType: 'application/json',
            body: fileContent,
        },
    })
    .then(response => {
        console.log('File uploaded successfully:', response.result);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}