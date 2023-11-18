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
  const dropdown = document.getElementById('traitDropdown');
  const labelIndex = dropdown.selectedIndex;

  if (labelIndex == -1){
    window.alert("Please choose a trait before submitting.");
  }
  else{
    if(numAvailableImages() >= 3){
      getUserToken()
      .then(userToken => sendFileToGoogleDrive(userToken))
      .catch(error => console.error(error));
      loadRandomImages(5);
    }
    else{
      console.log('all images have been seen');
    }
  }
}

function getRandomElements(array, numElements) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, numElements);
  }

