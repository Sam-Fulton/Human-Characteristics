// Add this at the beginning of your script to keep track of used filenames
const usedFilenames = new Set();

// Flag to check if it's the first load
let isFirstLoad = true;

imagesAvailable = [];

function loadRandomImages(numImages) {
  var embedContainer = document.querySelector('.rank-svg');

  const owner = 'Sam-Fulton';
  const repo = 'Human-Characteristics';
  const path = 'resources/images';

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch directory contents. Status: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        const imageFiles = data

          .filter(file => file.type === 'file' && file.name.match(/\.(png)$/i));

        imagesAvailable = imageFiles;
        if (isFirstLoad || usedFilenames.size < numImages) {
          const uniqueImageFiles = getUniqueElements(imageFiles, numImages);

          uniqueImageFiles.forEach((file, index) => {
            const filename = file.name;
            const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}/${filename}`;

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

          console.log(embeddedElements);

          if (numEmbeddedElements == 5) {
            const newFilenames = getUniqueElements(imageFiles, 3);

            console.log(newFilenames);

            if (newFilenames.length < 3) {
              // If there are not enough new images, prompt the user and end the page
              alert("Not enough new images available. Please try again later.");
              return;
            }

            newFilenames.forEach((file, index) => {
              const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}/${file.name}`;

              embeddedElements[index + 1].src = imageUrl;

              usedFilenames.add(file.name);
            });
          }
        }
      } else {
        console.error('Invalid data format received from the GitHub API.');
      }
    })
    .catch(error => console.error('Error fetching directory contents:', error));
}

function getUniqueElements(array, numElements) {
  console.log(usedFilenames);
  const shuffledArray = array.filter(file => !usedFilenames.has(file.name)).sort(() => Math.random() - 0.5);
  return shuffledArray.slice(0, numElements);
}

function numAvailableImages() {
  return getUniqueElements(imagesAvailable, imagesAvailable.length - usedFilenames.size).length;
}