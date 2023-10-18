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
  
          if (imageFiles.length >= numImages) {
            const randomImageFiles = getRandomElements(imageFiles, numImages);
  
            randomImageFiles.forEach((file, index) => {
              const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}/${file.name}`;
  
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
          } else {
            console.error(`Not enough valid image files found in the repository. Required: ${numImages}, Found: ${imageFiles.length}`);
          }
        } else {
          console.error('Invalid data format received from the GitHub API.');
        }
      })
      .catch(error => console.error('Error fetching directory contents:', error));
  }
  