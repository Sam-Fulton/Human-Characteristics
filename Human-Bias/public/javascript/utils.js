function decodeTokenAndReload() {
  const userToken = sessionStorage.getItem('userToken');
  console.log('Retrieved Token:', userToken);

  if (!userToken) {
    console.error('User token not found.');
    return;
  }

  fetch('http://localhost:5000/handle-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: userToken }), 
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data);

      if (data.userId) {
        reloadImagesAndUpload(data.userId, userToken);
      } else {
        console.error('User ID not found in data.');
      }
    } else {
      console.error('Error decoding token:', data.error);
    }
  })
  .catch(error => console.error('Error sending token to server:', error));
}

function reloadImagesAndUpload() {
  getUserToken()
  .then(userToken => sendFileToGoogleDrive(userToken))
  .catch(error => console.error(error));

  const embedContainer = document.querySelector('.rank-svg');
  embedContainer.innerHTML = '';

  loadRandomImages(5);
}

function getRandomElements(array, numElements) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, numElements);
  }

