function sendFileToGoogleDrive() {
    console.log('Sending file to Google Drive...');

    const label1 = document.getElementById('label1').textContent;
    const label2 = document.getElementById('label2').textContent;

    const embedElements = document.querySelectorAll('.rank-svg embed');

    // Assume you have a function getTokenFromStore to get the user token from your token store
    const userToken = getTokenFromStore();
    const userId = userToken ? userToken.user_id : null;

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

    fetch('http://localhost:5000/upload-to-drive', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: content,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('File uploaded successfully. File ID:', data.fileId);
        } else {
            console.error('Error uploading file:', data.error);
        }
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}
