function getRandomElements(array, numElements) {
    const shuffledArray = array.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, numElements);
  }

function reloadImagesAndUpload() {
    initDriveAPI().then(()=>{
        sendFileToGoogleDrive();
    });

    const embedContainer = document.querySelector('.rank-svg');
    embedContainer.innerHTML = '';

    loadRandomImages(5);
}