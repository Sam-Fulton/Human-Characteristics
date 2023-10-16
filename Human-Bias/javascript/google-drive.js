function handleAPILoadError(error) {
    console.error('Error loading API:', error);
  }


function signIn() {
    gapi.auth2.getAuthInstance().signIn().then(function () {
        const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        onSignIn(googleUser);
    });
}

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const userId = profile.getId();
    const userName = profile.getName();
    const userEmail = profile.getEmail();

    console.log('User ID: ' + userId);
    console.log('User Name: ' + userName);
    console.log('User Email: ' + userEmail);
}


function initGoogleAPI(googleUser) {
    gapi.load('client:auth2', function () {
      gapi.auth2.init({
        client_id: '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com',
      }).then(() => {
        gapi.client.init({
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