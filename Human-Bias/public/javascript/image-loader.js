// Add this at the beginning of your script to keep track of used filenames
const usedFilenames = new Set();

// Flag to check if it's the first load
let isFirstLoad = true;

imagesAvailable = [];

function loadRandomImages(numImages) {
  var embedContainer = document.querySelector('.rank-svg');

  const baseURL = window.location.origin;
  const apiUrl = `${baseURL}/all-images`;
  console.log(apiUrl);

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch images from the server. Status: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(imageFiles => {
      imagesAvailable = imageFiles;


      if (isFirstLoad || usedFilenames.size < numImages) {
        const uniqueImageFiles = getUniqueElements(imageFiles, numImages);

        uniqueImageFiles.forEach((file, index) => {
          const filename = file.name;
          const imageUrl = `https://raw.githubusercontent.com/Sam-Fulton/human-bias-images/main/images/${filename}`;

          const embedElement = document.createElement('embed');
          embedElement.src = imageUrl;
          embedElement.width = '100px';

          const xPosition = 30 + index * 10;
          embedElement.setAttribute('x', `${xPosition}%`);

          embedElement.dataset.index = index;
          embedElement.draggable = true;
          embedElement.ondragstart = dragStart;

          embedContainer.appendChild(embedElement);

          addDragDropListeners(embedElement);

          usedFilenames.add(filename);
        });

        isFirstLoad = false;
      } else {
        const embeddedElements = embedContainer.querySelectorAll('embed');
        const numEmbeddedElements = embeddedElements.length;

        if (numEmbeddedElements === 5) {
          const newFilenames = getUniqueElements(imageFiles, 3);

          if (newFilenames.length < 3) {
            // If there are not enough new images, prompt the user and end the page
            alert("Not enough new images available. Please try again later.");
            return;
          }

          newFilenames.forEach((file, index) => {
            const imageUrl = `https://raw.githubusercontent.com/Sam-Fulton/human-bias-images/main/images/${file.name}`;
            embeddedElements[index + 1].src = imageUrl;

            usedFilenames.add(file.name);
          });
        }
      }
    })
    .catch(error => console.error('Error fetching images from the server:', error));
}

function getUniqueElements(array, numElements) {
  console.log(usedFilenames);
  const shuffledArray = array.filter(file => !usedFilenames.has(file.name)).sort(() => Math.random() - 0.5);
  return shuffledArray.slice(0, numElements);
}

function numAvailableImages() {
  return getUniqueElements(imagesAvailable, imagesAvailable.length - usedFilenames.size).length;
}

function restart(){
  usedFilenames.clear();
  isFirstLoad = true;
  imagesAvailable = [];
  document.querySelector('.rank-svg').innerHTML = '';
  const dropdown = document.getElementById('traitDropdown');
  dropdown.selectedIndex = -1;
  unlockDropdown(dropdown);
  const selectedTrait = document.getElementById('selectedTrait');
  selectedTrait.textContent = "Selected Trait: None";
  loadRandomImages(5);
  window.alert("Successfully restarted, please choice a trait and rank the images.");
}