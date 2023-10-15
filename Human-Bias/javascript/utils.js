function getRandomElements(array, numElements) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, numElements);
  }

  function reloadImagesAndUpload() {
    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    const userId = googleUser.getId();

    sendFileToGoogleDrive(userId);

    const embedContainer = document.querySelector('.rank-svg');
    embedContainer.innerHTML = '';

    loadRandomImages(5);
}