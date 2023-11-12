// Add this at the beginning of your script to keep track of used filenames
const usedFilenames = new Set();

// Flag to check if it's the first load
let isFirstLoad = true;

function loadRandomImages(numImages) {
    const embedContainer = document.querySelector('.rank-svg');
  
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
  
          if (isFirstLoad || usedFilenames.size < numImages) {
            // For the first load or when not enough unique images have been used
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

              // Add the used filename to the set
              usedFilenames.add(filename);
            });

            // After the first load, set the flag to false
            isFirstLoad = false;
          } else {
            // For subsequent refreshes, keep the lowest and highest ranked items
            const sortedFilenames = Array.from(usedFilenames).sort();

            // Remove the lowest and highest ranked items
            usedFilenames.delete(sortedFilenames[0]);
            usedFilenames.delete(sortedFilenames[sortedFilenames.length - 1]);

            // Get new filenames for the middle 3 images
            const newFilenames = getUniqueElements(imageFiles, 3);

            // Add the new filenames to the set
            newFilenames.forEach(filename => usedFilenames.add(filename));

            // Update the DOM with the new images
            embedContainer.innerHTML = ''; // Clear the container
            usedFilenames.forEach((filename, index) => {
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
            });
          }
        } else {
          console.error('Invalid data format received from the GitHub API.');
        }
      })
      .catch(error => console.error('Error fetching directory contents:', error));
  }
