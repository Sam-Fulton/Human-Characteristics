function sendFileToGoogleDrive(userId, accessToken) {
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

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
        },
        body: fileContent,
    })
    .then(response => response.json())
    .then(data => {
        console.log('File uploaded successfully:', data);
    })
    .catch(error => {
        console.error('Error uploading file:', error);
    });
}