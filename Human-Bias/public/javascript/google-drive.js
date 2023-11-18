function getUserToken() {
    return fetch(`/get-user-token`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          return data.token;
        } else {
          throw new Error(`Error retrieving user token: ${data.error}`);
        }
      });
  }

function sendFileToGoogleDrive(tokenStore) {
    console.log('Sending file to Google Drive...');
  
    const dropdown = document.getElementById('traitDropdown');
    const label = dropdown.options[dropdown.selectedIndex].text;
  
    const embedElements = document.querySelectorAll('.rank-svg embed');
  
    console.log('Sending file to Google Drive tokenstore', tokenStore);

    const userId = tokenStore.userId;
  
    const content = {
      userId: userId,
      label: label,
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
    
    const baseURL = window.location.origin;
    // Make a request to upload to Google Drive with the obtained user token
    fetch(`${baseURL}/upload-to-drive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStore.access_token}`,
      },
      body: JSON.stringify({
        content: fileContent,
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